
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye,
  Crown,
  Lock
} from 'lucide-react';
import type { User } from '../../../server/src/schema';

interface AnalyticsProps {
  user: User;
  theme: 'light' | 'dark';
  onNavigate: (view: 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview') => void;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  clickThroughRate: number;
  topLinks: Array<{
    id: string;
    title: string;
    clicks: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

export function Analytics({ user, theme, onNavigate }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo analytics data - memoized to prevent recreation
  const demoAnalyticsData = useMemo((): AnalyticsData => ({
    totalViews: 3456,
    totalClicks: 1234,
    uniqueVisitors: 2890,
    clickThroughRate: 35.7,
    topLinks: [
      { id: 'link-1', title: 'My Website', clicks: 456, percentage: 37 },
      { id: 'link-2', title: 'Instagram', clicks: 321, percentage: 26 },
      { id: 'link-3', title: 'YouTube Channel', clicks: 287, percentage: 23 },
      { id: 'link-4', title: 'Buy Me a Coffee', clicks: 170, percentage: 14 }
    ],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 150) + 50,
      clicks: Math.floor(Math.random() * 50) + 20
    }))
  }), []);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load analytics data from API
      setAnalyticsData(demoAnalyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [demoAnalyticsData]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (!user.is_premium) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get detailed insights into your link performance
            </p>
          </div>

          {/* Premium Upgrade Card */}
          <Card className={`${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
          } backdrop-blur-sm text-center p-12`}>
            <div className="max-w-md mx-auto">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                <Lock className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                Analytics Available in Pro
              </h2>
              
              <p className={`text-lg mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Unlock detailed analytics to track your performance and grow your audience
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Detailed click tracking',
                  'Visitor demographics',
                  'Traffic sources analysis',
                  'Performance trends',
                  'Export data capabilities'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                onClick={() => onNavigate('billing')}
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              Analytics
              <Crown className="h-6 w-6 ml-2 text-yellow-500" />
            </h1>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track your link performance and audience engagement
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={(value: '7' | '30' | '90') => setTimeRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-gray-200/50'
              } backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className={`h-4 w-20 mb-2 rounded animate-pulse ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <div className={`h-8 w-16 mb-2 rounded animate-pulse ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                  <div className={`h-3 w-24 rounded animate-pulse ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyticsData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last period
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
                  <div className="text-2xl font-bold">{analyticsData.totalClicks.toLocaleString()}</div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8% from last period
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
                  <div className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +15% from last period
                  </p>
                </CardContent>
              </Card>

              <Card className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-gray-200/50'
              } backdrop-blur-sm`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                  <BarChart3 className={`h-4 w-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.clickThroughRate}%</div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +3% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Top Links */}
              <div className="lg:col-span-2">
                <Card className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/70 border-gray-200/50'
                } backdrop-blur-sm`}>
                  <CardHeader>
                    <CardTitle>Top Performing Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topLinks.map((link, index) => (
                        <div key={link.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              index === 0 
                                ? 'bg-yellow-500 text-white'
                                : index === 1
                                ? 'bg-gray-400 text-white'
                                : index === 2
                                ? 'bg-orange-400 text-white'
                                : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{link.title}</p>
                              <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {link.clicks} clicks
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {link.percentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div>
                <Card className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/70 border-gray-200/50'
                } backdrop-blur-sm`}>
                  <CardHeader>
                    <CardTitle>Quick Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best day</span>
                      <span className="font-medium">Monday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Peak hour</span>
                      <span className="font-medium">2-3 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Top source</span>
                      <span className="font-medium">Instagram</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Top country</span>
                      <span className="font-medium">United States</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
