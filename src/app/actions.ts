'use server';

import { chatbotFAQAssistance } from '@/ai/flows/chatbot-faq-assistance';
import { chatbotRecognizesBookingIntent } from '@/ai/flows/chatbot-recognizes-booking-intent';
import { translateText } from '@/ai/flows/translate-ui-chatbot-responses';
import { chatbotSuggestVisitTimes } from '@/ai/flows/chatbot-suggest-visit-times';
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
        // 1. Check for booking intent
        const bookingIntent = await chatbotRecognizesBookingIntent({
            message: newUserMessage,
            userId: userId,
        });

        if (bookingIntent.intentRecognized && bookingIntent.followUpMessage) {
            
            // 2. If booking intent, suggest visit times
            try {
                const today = new Date();
                const visitTimes = await chatbotSuggestVisitTimes({
                    museumId: bookingIntent.suggestedMuseums?.[0]?.museumId || 'museum-1',
                    date: today.toISOString().split('T')[0],
                    currentHour: today.getHours(),
                });

                if (visitTimes.suggestedTimes && visitTimes.suggestedTimes.length > 0) {
                    const timeSuggestions = visitTimes.suggestedTimes.map(t => 
                        `${t.startTime} - ${t.endTime} (Crowd: ${t.crowdLevel})`
                    ).join('\n');
                    
                    botResponse = `${bookingIntent.followUpMessage}\n\nHere are some suggested times:\n${timeSuggestions}\n\nWould you like to book for any of these times?`;
                } else {
                    botResponse = bookingIntent.followUpMessage;
                }

            } catch (e) {
                console.error("Error getting visit times:", e);
                // Fallback to the original booking intent message
                 botResponse = bookingIntent.followUpMessage;
            }

        } else {
            // 3. If no booking intent, handle as FAQ
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
    await saveChatMessage(userId, newUserMessage, botResponse);

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
