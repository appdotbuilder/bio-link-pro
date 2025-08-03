
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '../../server/src/schema';

// Components
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { LinkEditor } from '@/components/LinkEditor';
import { PreviewPage } from '@/components/PreviewPage';
import { Analytics } from '@/components/Analytics';
import { Billing } from '@/components/Billing';
import { AuthModal } from '@/components/AuthModal';
import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';

type AppView = 'landing' | 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [previewUsername, setPreviewUsername] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Default user data for demo purposes - memoized to prevent recreation
  const defaultUser = useMemo((): User => ({
    id: 'user-1',
    email: 'demo@biolink.pro',
    username: 'demouser',
    display_name: 'Demo User',
    avatar_url: null,
    bio: 'Welcome to my BioLink Pro page! 🚀',
    theme: 'light',
    is_premium: false,
    subscription_id: null,
    subscription_status: null,
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date()
  }), []);

  useEffect(() => {
    // Initialize demo user
    setUser(defaultUser);
    setTheme(defaultUser.theme);
    setCurrentView('dashboard');
  }, [defaultUser]);

  const handleLogin = useCallback(() => {
    // Authentication logic would be implemented here
    setUser(defaultUser);
    setCurrentView('dashboard');
    setIsAuthModalOpen(false);
  }, [defaultUser]);

  const handleRegister = useCallback((email: string, username: string) => {
    // Registration logic would be implemented here
    const newUser = { ...defaultUser, email, username };
    setUser(newUser);
    setCurrentView('dashboard');
    setIsAuthModalOpen(false);
  }, [defaultUser]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentView('landing');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (user) {
      // Theme persistence would be implemented here
      setUser(prev => prev ? { ...prev, theme: newTheme } : null);
    }
  }, [theme, user]);

  const handleViewChange = useCallback((view: AppView, username?: string) => {
    setCurrentView(view);
    if (username) {
      setPreviewUsername(username);
    }
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage 
            onGetStarted={() => {
              setAuthMode('register');
              setIsAuthModalOpen(true);
            }}
            onLogin={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      
      case 'dashboard':
        return user ? (
          <Dashboard 
            user={user} 
            theme={theme} 
            onNavigate={handleViewChange}
          />
        ) : null;
      
      case 'editor':
        return user ? (
          <LinkEditor 
            user={user} 
            theme={theme}
            onNavigate={handleViewChange}
          />
        ) : null;
      
      case 'analytics':
        return user ? (
          <Analytics 
            user={user} 
            theme={theme}
            onNavigate={handleViewChange}
          />
        ) : null;
      
      case 'billing':
        return user ? (
          <Billing 
            user={user} 
            theme={theme}
            onNavigate={handleViewChange}
          />
        ) : null;
      
      case 'preview':
        return (
          <PreviewPage 
            theme={theme} 
            username={previewUsername}
            onNavigate={handleViewChange}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
      }`}>
        {user && currentView !== 'landing' && currentView !== 'preview' && (
          <Navigation 
            user={user} 
            currentView={currentView}
            onLogout={handleLogout}
            onNavigate={handleViewChange}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        
        {renderCurrentView()}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          mode={authMode}
          onModeChange={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          theme={theme}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
