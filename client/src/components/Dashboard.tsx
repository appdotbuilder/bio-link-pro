
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Edit3, 
  Eye, 
  BarChart3, 
  Crown, 
  ExternalLink,
  Users,
  MousePointer,
  TrendingUp
} from 'lucide-react';
import type { User, Link as LinkType } from '../../../server/src/schema';

interface DashboardProps {
  user: User;
  theme: 'light' | 'dark';
  onNavigate: (view: 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview', username?: string) => void;
}

export function Dashboard({ user, theme, onNavigate }: DashboardProps) {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    uniqueVisitors: 0
  });

  // Demo links data - memoized to prevent recreation
  const demoLinks = useMemo((): LinkType[] => [
    {
      id: 'link-1',
      user_id: user.id,
      title: 'My Website',
      url: 'https://example.com',
      icon: '🌐',
      description: 'Check out my personal website',
      order_index: 0,
      is_active: true,
      click_count: 245,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-2',
      user_id: user.id,
      title: 'Instagram',
      url: 'https://instagram.com/username',
      icon: '📸',
      description: 'Follow me on Instagram',
      order_index: 1,
      is_active: true,
      click_count: 189,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'link-3',
      user_id: user.id,
      title: 'YouTube Channel',
      url: 'https://youtube.com/channel',
      icon: '🎥',
      description: 'Subscribe to my channel',
      order_index: 2,
      is_active: true,
      click_count: 312,
      created_at: new Date(),
      updated_at: new Date()
    }
  ], [user.id]);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load user data from API
      setLinks(demoLinks);
      setStats({
        totalViews: 1250,
        totalClicks: 746,
        uniqueVisitors: 892
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [demoLinks]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const linkLimit = user.is_premium ? Infinity : 5;
  const usedLinks = links.length;
  const progressPercentage = user.is_premium ? 0 : (usedLinks / linkLimit) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.display_name || user.username}! 👋
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your link-in-bio page and track your performance
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => onNavigate('preview', user.username)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button onClick={() => onNavigate('editor')}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className={`h-4 w-4 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className={`h-4 w-4 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className={`h-4 w-4 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Links Management */}
        <div className="lg:col-span-2">
          <Card className={`${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          } backdrop-blur-sm`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  Your Links
                  <Badge variant="secondary" className="ml-2">
                    {links.length}
                  </Badge>
                </CardTitle>
                
                <Button size="sm" onClick={() => onNavigate('editor')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              {!user.is_premium && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Link Usage</span>
                    <span>{usedLinks}/{linkLimit}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  {usedLinks >= linkLimit && (
                    <p className="text-sm text-orange-600">
                      You've reached your link limit. 
                      <button 
                        onClick={() => onNavigate('billing')}
                        className="underline ml-1"
                      >
                        Upgrade to Pro
                      </button>
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-16 rounded-lg animate-pulse ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No links yet</h3>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Start building your link-in-bio page by adding your first link
                  </p>
                  <Button onClick={() => onNavigate('editor')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link: LinkType) => (
                    <div 
                      key={link.id}
                      className={`flex items-center p-4 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
                          : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold mr-4">
                        {link.icon || link.title.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{link.title}</h4>
                        <p className={`text-sm truncate ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {link.description || link.url}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {link.click_count} clicks
                        </Badge>
                        
                        <Button size="sm" variant="ghost" onClick={() => onNavigate('editor')}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Upgrade */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className={`${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          } backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => onNavigate('editor')}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Links
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => onNavigate('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => onNavigate('preview', user.username)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          {!user.is_premium && (
            <Card className={`${
              theme === 'dark'
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
            } backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  Upgrade to Pro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Unlimited links
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Advanced analytics
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Custom themes
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    QR code generator
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => onNavigate('billing')}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
