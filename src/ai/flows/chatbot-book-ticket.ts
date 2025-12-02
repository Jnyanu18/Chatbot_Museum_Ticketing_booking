
'use server';
/**
 * @fileOverview A Genkit flow that handles the entire ticket booking conversation via chatbot.
 * It uses tools to find museums/events and create the final booking.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { EVENTS, MUSEUMS } from '@/lib/data';
import type { Booking } from '@/lib/types';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Define schemas for tool input/output
const createBookingSchema = z.object({
  userId: z.string().describe('The ID of the user making the booking.'),
  museumId: z.string().describe('The ID of the museum.'),
  eventId: z.string().describe('The ID of the event.'),
  numTickets: z.number().describe('The number of tickets to book.'),
  contactEmail: z.string().email().describe("The user's contact email address."),
  visitorNames: z.array(z.string()).optional().describe("Names of the visitors."),
  specialRequests: z.string().optional().describe("Any special requests for the booking."),
});

// Define schemas for flow input/output
const ChatbotBookTicketInputSchema = z.object({
  userId: z.string(),
  history: z.array(z.any()).describe('The full conversation history, including the latest user message.'),
});

export type ChatbotBookTicketInput = z.infer<typeof ChatbotBookTicketInputSchema>;


const BookingDataSchema = z.object({
  intent: z.literal("book_ticket"),
  museum: z.string().describe("The name of the museum."),
  visit_date: z.string().describe("The date of the visit in YYYY-MM-DD format."),
  visit_time: z.string().describe("The time of the visit, e.g., '11:00' or 'morning'"),
  tickets_count: z.number().int().positive(),
  ticket_type: z.enum(["adult", "child", "student", "senior", "mixed"]),
  visitor_names: z.array(z.string()).optional(),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  payment_required: z.boolean(),
  payment_amount: z.number(),
  payment_currency: z.string(),
  special_requests: z.string().optional(),
  booking_ref: z.null(),
});


const ChatbotBookTicketOutputSchema = z.object({
    isBookingReady: z.boolean().describe('Set to true only when all required slots are filled and you are ready to ask for final confirmation.'),
    isBookingComplete: z.boolean().describe('Set to true only when the ticket booking has been successfully confirmed and created by the tool.'),
    followUpMessage: z.string().describe('The message to send back to the user to gather more information or confirm the booking.'),
    bookingData: BookingDataSchema.optional().describe('The complete booking data object, to be included only when isBookingReady is true.'),
});

export type ChatbotBookTicketOutput = z.infer<typeof ChatbotBookTicketOutputSchema>;

// Export the main function to be called from the server action
export async function chatbotBookTicket(input: ChatbotBookTicketInput): Promise<ChatbotBookTicketOutput> {
  return chatbotBookTicketFlow(input);
}


// Tool: Create the actual booking in Firestore
const createBookingTool = ai.defineTool(
  {
    name: 'createBooking',
    description: 'Creates a museum ticket booking in the database. Call this ONLY when you have all required information and the user has confirmed they want to proceed.',
    inputSchema: createBookingSchema,
    outputSchema: z.object({ success: z.boolean(), confirmationMessage: z.string() }),
  },
  async (input) => {
    console.log('Creating booking with tool:', input);
    const { firestore } = initializeFirebase();
    const event = EVENTS.find(e => e.id === input.eventId);
    const museum = MUSEUMS.find(m => m.id === input.museumId);

    if (!event || !museum) {
      console.error('Event or Museum not found for booking');
      return { success: false, confirmationMessage: "I'm sorry, I couldn't find the details for that event or museum." };
    }

    const newBooking: Omit<Booking, 'id' | 'createdAt'> = {
      userId: input.userId,
      eventId: input.eventId,
      museumId: input.museumId,
      numTickets: input.numTickets,
      pricePaid: event.basePrice * input.numTickets,
      currency: 'USD',
      status: 'paid', // Simulate successful payment
      eventTitle: event.title,
      museumName: museum.name,
      eventDate: event.date,
    };
    
    try {
        const bookingsCollection = collection(firestore, 'users', input.userId, 'bookings');
        await addDoc(bookingsCollection, {
            ...newBooking,
            createdAt: serverTimestamp(),
        });
        const confirmation = `Your booking is confirmed! You'll receive details for your ${input.numTickets} tickets to ${event.title} shortly.`;
        return { success: true, confirmationMessage: confirmation };
    } catch(e) {
        console.error('Firestore error in createBookingTool:', e);
        return { success: false, confirmationMessage: "I'm sorry, there was an error while creating your booking. Please try again later." };
    }
  }
);


// The Genkit Flow
const chatbotBookTicketFlow = ai.defineFlow(
  {
    name: 'chatbotBookTicketFlow',
    inputSchema: ChatbotBookTicketInputSchema,
    outputSchema: ChatbotBookTicketOutputSchema,
  },
  async (input) => {
    
    const museumAndEventContext = `
      Here are the available museums:
      ${MUSEUMS.map(m => `- ${m.name} (ID: ${m.id}) located in ${m.location.city}`).join('\n')}

      Here are the available events:
      ${EVENTS.map(e => `- "${e.title}" (ID: ${e.id}) at Museum ID ${e.museumId}`).join('\n')}
    `;

    const llmResponse = await ai.generate({
      prompt: `You are MuseBot — a friendly, conversational ticket-booking assistant for museums. Your goals:
      1. Gather booking info via short natural chat (slot-filling): museum, visit_date (YYYY-MM-DD), visit_time (HH:MM or "morning/afternoon/evening"), tickets_count, ticket_type (adult/child/student/senior), visitor_names (optional), contact_email, contact_phone, payment_method (card/upi/cash/none), special_requests (optional).
      2. Always be polite, helpful, concise, and confirm ambiguous inputs.
      3. Ask only one question at a time. Validate user answers (dates in future, numbers positive, email format). If invalid, ask a corrective question.
      4. If user asks for suggestions, recommend 3 nearby museums with a 1-line highlight each and ask which one they'd like.
      5. When all required slots are filled, set 'isBookingReady' to true, 'followUpMessage' to a human-readable summary, AND include the machine-friendly 'bookingData' JSON object in your response. Then ask the user whether to confirm and proceed to payment.
      6. Provide helpful defaults/suggestions (nearest available time slots, family discounts) when relevant.
      7. Handle cancellation/rescheduling: confirm intent, show booking summary, ask for updated fields.
      8. If user expresses privacy concerns, explain data use and ask for consent to store booking data.
      9. Keep responses < 160 words unless user asks for details.
      10. For unknown or out-of-scope requests, offer alternatives or escalate to a human operator by setting 'followUpMessage' to a polite fallback message.
      11. If the user confirms the booking summary, call the 'createBooking' tool. Once the tool returns a result, set 'isBookingComplete' to true and use the tool's confirmation message as your 'followUpMessage'.

      Available Data Context:
      ${museumAndEventContext}

      Always end booking-ready responses with: "Shall I confirm this booking now?" or "Would you like to change anything?"
      If the user is not trying to book a ticket, or the conversation is not related to booking, just respond naturally and set both isBookingReady and isBookingComplete to false. For non-booking queries, provide a helpful, conversational response.
      `,
      history: input.history,
      tools: [createBookingTool],
      output: {
        schema: ChatbotBookTicketOutputSchema
      }
    });
    
    // Ensure we always return a valid output, even if the model fails to generate one.
    const output = llmResponse.output;
    if (output) {
      // If the booking is not ready and not complete, but there's a follow up, it's just a regular chat turn.
      // If there's no follow-up, it means the conversation is likely not about booking.
      // In this case, we allow the main action handler to fall back to the FAQ flow.
      if (!output.isBookingReady && !output.isBookingComplete && !output.followUpMessage) {
        return {
          isBookingReady: false,
          isBookingComplete: false,
          followUpMessage: "I can help with museum information and ticket bookings. What would you like to do?",
          bookingData: undefined,
        }
      }
      return output;
    }

    return {
        isBookingReady: false,
        isBookingComplete: false,
        followUpMessage: "I'm sorry, I'm having a little trouble. Could you please rephrase that?",
        bookingData: undefined,
    };
  }
);
