
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, username: string, password: string) => void;
  theme: 'light' | 'dark';
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  mode, 
  onModeChange, 
  onLogin, 
  onRegister,
  theme 
}: AuthModalProps) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(loginForm.email, loginForm.password);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await onRegister(registerForm.email, registerForm.username, registerForm.password);
      setRegisterForm({ email: '', username: '', password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to BioLink Pro
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLoginForm(prev => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLoginForm(prev => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRegisterForm(prev => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-username">Username</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={registerForm.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRegisterForm(prev => ({ ...prev, username: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create a password"
                  value={registerForm.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRegisterForm(prev => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
