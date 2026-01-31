import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare, Store, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, identity, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        navigate({ to: '/dashboard' });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ShopBot</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              AI Customer Support for Your Local Shop
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create an intelligent chatbot that answers customer questions 24/7 using your shop's information
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Store className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Easy Setup</CardTitle>
                <CardDescription>
                  Input your shop details once and let AI handle customer inquiries
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Instant Answers</CardTitle>
                <CardDescription>
                  Customers get immediate responses based on your shop's information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Shareable Link</CardTitle>
                <CardDescription>
                  Get a unique URL to share with customers on social media or your website
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Sign in with Internet Identity to create your shop's AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLogin}
                  disabled={loginStatus === 'logging-in'}
                  className="w-full"
                  size="lg"
                >
                  {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In with Internet Identity'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with love using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
