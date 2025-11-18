'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X, Loader2, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getChatbotResponse } from '@/app/actions';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Hello! I'm the MuseumConnect assistant. How can I help you today? You can ask about our museums, events, or book tickets.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
        const history = messages.map(m => ({
            role: m.role,
            content: m.content,
        }));
        
        const response = await getChatbotResponse(history, inputValue);
        const botMessage: Message = { role: 'bot', content: response };
        setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
        const errorMessage: Message = { role: 'bot', content: 'Sorry, I am having trouble connecting. Please try again later.' };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableViewport = scrollAreaRef.current.children[1] as HTMLDivElement;
        if(scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-[calc(100vw-3rem)] max-w-md"
            >
              <Card className="flex h-[70vh] flex-col shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="font-headline">MuseumConnect AI</CardTitle>
                      <CardDescription>Your personal guide</CardDescription>
                    </div>
                  </div>
                   <Button variant="ghost" size="icon" onClick={toggleOpen}>
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex items-end gap-2',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {message.role === 'bot' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                            </Avatar>
                          )}
                           <div
                            className={cn(
                              'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            {message.content}
                          </div>
                           {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><User size={18}/></AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                            </Avatar>
                            <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin"/>
                            </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                      id="message"
                      placeholder="Type your message..."
                      className="flex-1"
                      autoComplete="off"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        >
        <Button
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg"
          onClick={toggleOpen}
        >
          {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
        </motion.div>
      </div>
    </>
  );
}
