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
        // In a real app, you might want more robust error handling,
        // but for now, we'll just log it to the server console.
    }
}


export async function getChatbotResponse(history: ChatMessage[], newUserMessage: string): Promise<string> {
    const userId = 'session-123'; // In a real app, this would be the actual user ID
    let botResponse = "I'm sorry, I couldn't understand that. Can you please rephrase?";
    
    try {
        // 1. Try to handle booking intent first
        const bookingResponse = await chatbotBookTicket({
            userId: userId,
            message: newUserMessage,
            history: history,
        });

        if (bookingResponse.isBookingComplete) {
            botResponse = `Your booking is confirmed! You will receive a confirmation shortly. Is there anything else I can help you with?`;
        } else if (bookingResponse.requiresFollowUp) {
            botResponse = bookingResponse.followUpMessage;
        } else {
            // 2. If not a booking query, handle as a general FAQ
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
