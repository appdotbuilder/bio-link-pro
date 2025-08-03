
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Sun, Moon } from 'lucide-react';
import type { User, Link as LinkType } from '../../../server/src/schema';

interface PreviewPageProps {
  theme: 'light' | 'dark';
  username?: string;
  onNavigate?: (view: 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview') => void;
}

export function PreviewPage({ theme: globalTheme, username, onNavigate }: PreviewPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(globalTheme);

  // Demo user data - memoized to prevent recreation
  const demoUser = useMemo((): User => ({
    id: 'user-1',
    email: 'demo@biolink.pro',
    username: 'demouser',
    display_name: 'Demo User ✨',
    avatar_url: null,
    bio: 'Welcome to my BioLink Pro page! 🚀\nCreator • Developer • Dreamer\n\nCheck out my latest projects below 👇',
    theme: 'light',
    is_premium: false,
    subscription_id: null,
    subscription_status: null,
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date()
  }), []);

  const demoLinks = useMemo((): LinkType[] => [
    {
      id: 'link-1',
      user_id: 'user-1',
      title: 'My Portfolio Website',
      url: 'https://example.com',
      icon: '🌐',
      description: 'Check out my latest projects and work',
      order_index: 0,
      is_active: true,
      click_count: 245,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-2',
      user_id: 'user-1',
      title: 'Instagram',
      url: 'https://instagram.com/username',
      icon: '📸',
      description: 'Follow my daily adventures and behind-the-scenes',
      order_index: 1,
      is_active: true,
      click_count: 189,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-3',
      user_id: 'user-1',
      title: 'YouTube Channel',
      url: 'https://youtube.com/channel',
      icon: '🎥',
      description: 'Subscribe for weekly tutorials and vlogs',
      order_index: 2,
      is_active: true,
      click_count: 312,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-4',
      user_id: 'user-1',
      title: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/username',
      icon: '☕',
      description: 'Support my work and get exclusive content',
      order_index: 3,
      is_active: true,
      click_count: 87,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-5',
      user_id: 'user-1',
      title: 'Newsletter',
      url: 'https://newsletter.example.com',
      icon: '📧',
      description: 'Get weekly insights and tips directly in your inbox',
      order_index: 4,
      is_active: true,
      click_count: 156,
      created_at: new Date(),
      updated_at: new Date()
    }
  ], []);

  const loadUserPage = useCallback(async () => {
    if (!username) return;
    
    setIsLoading(true);
    try {
      // Load user page data from API
      setUser(demoUser);
      setLinks(demoLinks);
      setTheme(demoUser.theme);
    } catch (error) {
      console.error('Failed to load user page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [username, demoUser, demoLinks]);

  useEffect(() => {
    loadUserPage();
  }, [loadUserPage]);

  const handleLinkClick = async (link: LinkType) => {
    // Track click would be implemented here
    try {
      // Click tracking logic
      console.log(`Tracking click for link: ${link.id}`);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
    
    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full animate-pulse ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            The page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-blue-400 to-purple-400'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-pink-500 to-purple-500' 
            : 'bg-gradient-to-br from-purple-400 to-pink-400'
        }`} />
      </div>

      {/* Theme toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`w-10 h-10 p-0 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-gray-800/50 hover:bg-gray-700/50' 
              : 'bg-white/50 hover:bg-white/70'
          }`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Profile Section */}
          <div className="text-center mb-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
            <div className="relative inline-block mb-6">
              <Avatar className="w-24 h-24 mx-auto border-4 border-white/20 shadow-xl">
                <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || user.username} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {user.is_premium && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm">👑</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-3">
              {user.display_name || user.username}
            </h1>
            
            {user.bio && (
              <div className={`text-center mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {user.bio.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">
                    {line}
                  </p>
                ))}
              </div>
            )}

            <Badge 
              variant="secondary" 
              className="bg-white/10 backdrop-blur-sm text-xs"
            >
              Powered by BioLink Pro
            </Badge>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            {links.map((link: LinkType, index: number) => (
              <div
                key={link.id}
                className="animate-in fade-in duration-500 slide-in-from-bottom-4"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Button
                  onClick={() => handleLinkClick(link)}
                  className={`w-full h-auto p-6 rounded-2xl border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gray-800/70 hover:bg-gray-700/70 text-white backdrop-blur-sm'
                      : 'bg-white/70 hover:bg-white/90 text-gray-900 backdrop-blur-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      {link.icon && (
                        <div className="flex-shrink-0 text-2xl">
                          {link.icon}
                        </div>
                      )}
                      
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg mb-1">
                          {link.title}
                        </div>
                        {link.description && (
                          <div className={`text-sm opacity-75 line-clamp-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {link.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ExternalLink className="h-5 w-5 opacity-50 flex-shrink-0 ml-4" />
                  </div>
                </Button>
              </div>
            ))}
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No links available yet.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Create your own link-in-bio page with{' '}
              <a 
                href="/" 
                className={`font-medium hover:underline ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) {
                    onNavigate('dashboard');
                  } else {
                    window.location.href = '/';
                  }
                }}
              >
                BioLink Pro
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
