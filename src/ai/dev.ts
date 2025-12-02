import { config } from 'dotenv';
config();

import '@/ai/flows/chatbot-faq-assistance.ts';
import '@/ai/flows/chatbot-book-ticket.ts';
import '@/ai/flows/chatbot-recognizes-booking-intent.ts';
import '@/ai/flows/translate-ui-chatbot-responses.ts';
import '@/ai/flows/chatbot-suggest-visit-times.ts';
import '@/ai/flows/get-project-suggestions.ts';
import '@/ai/flows/get-analytics-summary.ts';
