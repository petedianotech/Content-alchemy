'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Bot, User, Send, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';

import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const formSchema = z.object({
  prompt: z.string().min(1, 'Message cannot be empty.'),
});

interface Message {
  role: 'user' | 'model';
  content: { text: string }[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (values: z.infer<typeof formSchema>) => {
    const userMessage: Message = { role: 'user', content: [{ text: values.prompt }] };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    startGenerating(async () => {
      try {
        const result = await generateChatResponse({ prompt: values.prompt, history: messages });
        const modelMessage: Message = { role: 'model', content: [{ text: result.response }] };
        setMessages(prev => [...prev, modelMessage]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'There was a problem communicating with the AI. Please try again.',
        });
        // Remove the user's message if the API call fails
        setMessages(prev => prev.slice(0, prev.length -1));
      }
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="font-headline text-4xl font-bold text-primary flex items-center gap-3">
          <MessageSquare />
          AI Chat
        </h1>
        <p className="text-muted-foreground">
          Have a conversation with your AI assistant. Ask questions, get ideas, and more.
        </p>
      </div>

      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">Chat with PeteAi</h2>
            <p className="mt-1 text-muted-foreground">
              Start the conversation by typing your message below.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={cn('flex items-start gap-4', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'model' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div className={cn('max-w-2xl rounded-lg p-3', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border')}>
                <p className="whitespace-pre-wrap">{msg.content[0].text}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                   {user ? (
                        <User className="h-5 w-5" />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                </div>
              )}
            </div>
          ))
        )}
         {isGenerating && (
            <div className="flex items-start gap-4">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
              <div className="max-w-md rounded-lg bg-card border p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
      </div>

      <div className="mt-4 border-t pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSendMessage)}
            className="relative"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.handleSubmit(handleSendMessage)();
              }
            }}
          >
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Message PeteAi..."
                      className="min-h-[50px] resize-none pr-20"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <p className="text-xs text-muted-foreground flex items-center">
                    <CornerDownLeft className="h-3 w-3 mr-1" />
                    Enter to send, Shift + Enter for new line
                </p>
                <Button type="submit" size="icon" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
