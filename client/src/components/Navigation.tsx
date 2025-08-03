
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Edit3, 
  BarChart3, 
  CreditCard, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  ExternalLink 
} from 'lucide-react';
import type { User as UserType } from '../../../server/src/schema';

type AppView = 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview';

interface NavigationProps {
  user: UserType;
  currentView: AppView;
  onLogout: () => void;
  onNavigate: (view: AppView, username?: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Navigation({ user, currentView, onLogout, onNavigate, theme, onToggleTheme }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'editor' as const, label: 'Editor', icon: Edit3 },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-lg ${
      theme === 'dark'
        ? 'bg-gray-900/80 border-gray-800'
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center space-x-2"
          >
            <div className={`w-8 h-8 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`} />
            <span className="text-xl font-bold">BioLink Pro</span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className={`${
                  currentView === item.id
                    ? theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                    : ''
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="w-9 h-9 p-0"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('preview', user.username)}
              className="hidden sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Page
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.display_name || user.username} />
                    <AvatarFallback>
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.display_name || user.username}</p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => onNavigate('preview', user.username)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
