
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LinkIcon, 
  BarChart3, 
  Palette, 
  Smartphone, 
  Zap, 
  Crown,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function LandingPage({ onGetStarted, onLogin, theme, onToggleTheme }: LandingPageProps) {
  const features = [
    {
      icon: LinkIcon,
      title: 'Unlimited Links',
      description: 'Create beautiful link collections with custom icons and descriptions',
      premium: false
    },
    {
      icon: Palette,
      title: 'Custom Themes',
      description: 'Choose from elegant themes with glassmorphism effects',
      premium: false
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience across all devices and screen sizes',
      premium: false
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track clicks, views, and engagement with detailed insights',
      premium: true
    },
    {
      icon: Zap,
      title: 'Real-time Preview',
      description: 'See changes instantly with smooth animations',
      premium: false
    },
    {
      icon: Crown,
      title: 'Premium Features',
      description: 'QR codes, custom domains, and exclusive animations',
      premium: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }`} />
          <span className="text-xl font-bold">BioLink Pro</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTheme}
            className="w-9 h-9 p-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" onClick={onLogin}>
            Login
          </Button>
          <Button onClick={onGetStarted} className={`${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
          } text-white border-0`}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            ✨ The Modern Link-in-Bio Platform
          </Badge>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Create Your Perfect
            <br />
            Link-in-Bio Page
          </h1>
          
          <p className={`text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Build a stunning, professional link hub that showcases all your content in one place. 
            Perfect for creators, businesses, and influencers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className={`${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              } text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={onLogin}
              className={`px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                  : 'border-purple-500/50 text-purple-600 hover:bg-purple-50'
              }`}
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Shine Online
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Powerful features designed to help you create the perfect link-in-bio experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm'
                  : 'bg-white/70 border-gray-200/50 backdrop-blur-sm'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                      : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                  }`}>
                    <feature.icon className={`h-6 w-6 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  {feature.premium && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className={`${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } leading-relaxed`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20'
          : 'bg-gradient-to-r from-blue-50 to-purple-50'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className={`text-lg mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of creators who trust BioLink Pro with their online presence
          </p>
          
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className={`${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            } text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
          >
            Create Your Page Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-6 h-6 rounded ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`} />
            <span className="font-semibold">BioLink Pro</span>
          </div>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © 2024 BioLink Pro. Made with ❤️ for creators everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
