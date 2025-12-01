
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
});

// Define schemas for flow input/output
const ChatbotBookTicketInputSchema = z.object({
  userId: z.string(),
  history: z.array(z.any()).describe('The full conversation history, including the latest user message.'),
});

export type ChatbotBookTicketInput = z.infer<typeof ChatbotBookTicketInputSchema>;

const ChatbotBookTicketOutputSchema = z.object({
  isBookingComplete: z.boolean().describe('Set to true only when the ticket booking has been successfully confirmed and created.'),
  requiresFollowUp: z.boolean().describe('Set to true if the chatbot needs to ask a clarifying question to the user.'),
  followUpMessage: z.string().describe('The message to send back to the user to gather more information or confirm the booking.'),
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

    const newBooking: Omit<Booking, 'id'> = {
      userId: input.userId,
      eventId: input.eventId,
      museumId: input.museumId,
      numTickets: input.numTickets,
      pricePaid: event.basePrice * input.numTickets,
      currency: 'USD',
      status: 'paid', // Simulate successful payment
      createdAt: new Date(),
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
    // Provide context about available museums and events to the LLM.
    const museumAndEventContext = `
      Here are the available museums:
      ${MUSEUMS.map(m => `- ${m.name} (ID: ${m.id}) located in ${m.location.city}`).join('\n')}

      Here are the available events:
      ${EVENTS.map(e => `- "${e.title}" (ID: ${e.id}) at Museum ID ${e.museumId}`).join('\n')}
    `;

    const llmResponse = await ai.generate({
      prompt: `You are a museum ticketing chatbot. Your goal is to help the user book a ticket based on the provided conversation history.
      1. Analyze the conversation history to determine what information you already have (museum, event, number of tickets).
      2. If information is missing, ask clarifying questions one by one. Do not ask for information you already have. For example, if you don't know the event, ask "Which event are you interested in?". If you don't know how many tickets, ask "How many tickets would you like?".
      3. Use the provided context to find valid museum and event IDs based on the user's request.
      4. Once you have all the required information (museumId, eventId, numTickets), you MUST confirm with the user before calling the booking tool. For example: "Just to confirm, you want to book [numTickets] tickets for [Event Name] at [Museum Name]. Is that correct?"
      5. If the user confirms, and only then, call the \`createBooking\` tool with the collected details.
      6. After the tool call, use its output message as your final response. If the tool reports success, set \`isBookingComplete\` to true.
      7. If the user's message is not related to booking, or if they say "no" to the confirmation, you should respond naturally. Set \`isBookingComplete\` to false and \`requiresFollowUp\` to false. This allows the main action handler to fall back to the FAQ flow.

      ${museumAndEventContext}
      `,
      history: input.history,
      tools: [createBookingTool],
      output: {
        schema: ChatbotBookTicketOutputSchema
      }
    });
    
    // Ensure we always return a valid output, even if the model fails to generate one.
    const output = llmResponse.output();
    if (output) {
      return output;
    }

    return {
        isBookingComplete: false,
        requiresFollowUp: true,
        followUpMessage: "I'm sorry, I'm having a little trouble. Could you please rephrase that?"
    };
  }
);
