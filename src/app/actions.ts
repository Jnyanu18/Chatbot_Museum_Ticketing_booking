
'use server';

import { chatbotFAQAssistance } from '@/ai/flows/chatbot-faq-assistance';
import { chatbotBookTicket } from '@/ai/flows/chatbot-book-ticket';
import { translateText } from '@/ai/flows/translate-ui-chatbot-responses';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

interface ChatMessage {
    role: 'user' | 'bot' | 'system';
    content: string;
}

async function saveChatMessage(userId: string, userMessage: string, botResponse: string) {
    try {
        const { firestore } = initializeFirebase();
        const chatsCollection = collection(firestore, 'users', userId, 'chats');
        
        await addDoc(chatsCollection, {
            userMessage: userMessage,
            botResponse: botResponse,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving chat message to Firestore:", error);
    }
}

export async function getChatbotResponse(history: ChatMessage[], newUserMessage: string): Promise<string> {
    const userId = 'session-123'; // In a real app, this would be the actual user ID
    let botResponse = "I'm sorry, I couldn't understand that. Can you please rephrase?";

    // We pass the full history including the new message to the flows
    const currentHistory = [...history, { role: 'user' as const, content: newUserMessage }];
    
    try {
        // Step 1: Call the main booking flow. It will handle intent recognition itself.
        const bookingResponse = await chatbotBookTicket({
            userId: userId,
            history: currentHistory,
        });

        // If the booking flow provides a follow-up message, use it.
        // An empty message means the flow decided it's not a booking-related query.
        if (bookingResponse.followUpMessage) {
            botResponse = bookingResponse.followUpMessage;
        } else {
            // Step 2: If the booking flow has nothing to say, fall back to the general FAQ flow.
            const faqResponse = await chatbotFAQAssistance({
                query: newUserMessage,
            });

            if (faqResponse.answer) {
                botResponse = faqResponse.answer;
            }
        }

    } catch (error) {
        console.error('Error getting chatbot response:', error);
        botResponse = 'Sorry, I am having trouble connecting. Please try again later.';
    }

    // Save the conversation to Firestore
    if(botResponse) {
        await saveChatMessage(userId, newUserMessage, botResponse);
    }

    return botResponse;
}

export async function getTranslatedText(text: string, targetLanguage: string): Promise<string> {
    try {
        const response = await translateText({ text, targetLanguage });
        return response.translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return text; // Fallback to original text on error
    }
}
