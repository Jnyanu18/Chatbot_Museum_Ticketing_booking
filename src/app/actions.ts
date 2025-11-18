'use server';

import { chatbotFAQAssistance } from '@/ai/flows/chatbot-faq-assistance';
import { chatbotRecognizesBookingIntent } from '@/ai/flows/chatbot-recognizes-booking-intent';
import { translateText } from '@/ai/flows/translate-ui-chatbot-responses';
import { chatbotSuggestVisitTimes } from '@/ai/flows/chatbot-suggest-visit-times';

interface ChatMessage {
    role: 'user' | 'bot' | 'system';
    content: string;
}

export async function getChatbotResponse(history: ChatMessage[], newUserMessage: string): Promise<string> {
    const userId = 'session-123'; // In a real app, this would be the actual user ID
    
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
                    
                    return `${bookingIntent.followUpMessage}\n\nHere are some suggested times:\n${timeSuggestions}\n\nWould you like to book for any of these times?`;
                }

            } catch (e) {
                console.error("Error getting visit times:", e);
                // Fallback to the original booking intent message
                 return bookingIntent.followUpMessage;
            }

            return bookingIntent.followUpMessage;
        }

        // 3. If no booking intent, handle as FAQ
        const faqResponse = await chatbotFAQAssistance({
            query: newUserMessage,
        });

        if (faqResponse.answer) {
            return faqResponse.answer;
        }

        return "I'm sorry, I couldn't understand that. Can you please rephrase?";

    } catch (error) {
        console.error('Error getting chatbot response:', error);
        return 'Sorry, I am having trouble connecting. Please try again later.';
    }
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
