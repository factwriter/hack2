import { useParams } from '@tanstack/react-router';
import { useGetShop } from '../hooks/useQueries';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare, Send, Loader2, Store, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { generateEmbedding, generateChatResponse, OpenAIError, MissingEmbeddingsError } from '../lib/openai';
import { useActor } from '../hooks/useActor';
import { Alert, AlertDescription } from '../components/ui/alert';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CustomerChatPage() {
  const { shopId } = useParams({ from: '/shop/$shopId' });
  const { data: shop, isLoading } = useGetShop(shopId);
  const { actor } = useActor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (shop) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm the AI assistant for ${shop.name}. How can I help you today?`,
        },
      ]);
      setErrorMessage(null);
    }
  }, [shop]);

  const handleSend = async () => {
    if (!input.trim() || !shop || !actor || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Check if shop has embeddings
      if (!shop.rawDataEmbedding || shop.rawDataEmbedding.length === 0) {
        throw new MissingEmbeddingsError();
      }

      // Validate shop has raw data or basic information
      const hasShopData = shop.rawData || shop.hours || shop.services || shop.pricing;
      if (!hasShopData) {
        throw new MissingEmbeddingsError();
      }

      // Generate embedding for user question
      const questionEmbedding = await generateEmbedding(userMessage);

      // Find most similar shop data
      const similarities = await actor.findMostSimilarShop(questionEmbedding, BigInt(1), 0.5);

      let context = '';
      if (similarities.length > 0 && similarities[0][0] === shop.id) {
        context = shop.rawData || `Shop: ${shop.name}\nHours: ${shop.hours}\nServices: ${shop.services}\nPricing: ${shop.pricing}\nParking: ${shop.parking}\nPayments: ${shop.payments}\nNotes: ${shop.notes}`;
      } else {
        // If no similar data found, use the shop's basic information
        context = shop.rawData || `Shop: ${shop.name}\nHours: ${shop.hours}\nServices: ${shop.services}\nPricing: ${shop.pricing}\nParking: ${shop.parking}\nPayments: ${shop.payments}\nNotes: ${shop.notes}`;
      }

      // Generate response
      const response = await generateChatResponse(userMessage, context, messages);

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

      // Record analytics (non-blocking)
      try {
        await actor.recordTokenCount(shop.id, BigInt(1));
      } catch (error) {
        console.error('Failed to record analytics:', error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMsg = "I'm sorry, I'm having trouble processing your request right now. Please try again.";
      
      if (error instanceof MissingEmbeddingsError) {
        errorMsg = error.message;
      } else if (error instanceof OpenAIError) {
        if (error.code === 'MISSING_API_KEY') {
          errorMsg = "The AI service is not properly configured. Please contact the shop owner.";
        } else if (error.code === 'API_ERROR' || error.code === 'NETWORK_ERROR') {
          errorMsg = error.message;
        }
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMsg,
        },
      ]);
      
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Shop Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            The shop you're looking for doesn't exist or has been removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{shop.name}</h1>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isProcessing} size="icon">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Powered by{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
