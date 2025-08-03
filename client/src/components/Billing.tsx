
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Check, 
  Star, 
  CreditCard, 
  Calendar,
  Download,
  Settings
} from 'lucide-react';
import type { User } from '../../../server/src/schema';

interface BillingProps {
  user: User;
  theme: 'light' | 'dark';
  onNavigate: (view: 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview') => void;
}

export function Billing({ user, theme }: BillingProps) {
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    { free: '5 links', pro: 'Unlimited links' },
    { free: 'Basic themes', pro: 'Premium themes & customization' },
    { free: 'Basic analytics', pro: 'Advanced analytics & insights' },
    { free: '❌', pro: 'QR code generator' },
    { free: '❌', pro: 'Custom domains' },
    { free: '❌', pro: 'Remove BioLink Pro branding' },
    { free: '❌', pro: 'Priority support' },
    { free: '❌', pro: 'Advanced animations' }
  ];

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Payment processing would be implemented here
    setTimeout(() => {
      setIsLoading(false);
      alert('Upgrade simulation - would redirect to payment processor');
    }, 2000);
  };

  const handleManageSubscription = () => {
    // Subscription management would be implemented here
    alert('Would open subscription management portal');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            {user.is_premium ? 'Manage Subscription' : 'Upgrade to Pro'}
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {user.is_premium 
              ? 'Manage your BioLink Pro subscription and billing details'
              : 'Unlock the full potential of your link-in-bio page with BioLink Pro'
            }
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className={`mb-8 ${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              Current Plan
              {user.is_premium && (
                <Crown className="h-5 w-5 ml-2 text-yellow-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {user.is_premium ? 'BioLink Pro' : 'Free Plan'}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user.is_premium 
                    ? 'All premium features included'
                    : 'Basic features with limitations'
                  }
                </p>
                {user.is_premium && (
                  <div className="flex items-center mt-2 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {user.is_premium ? '$9.99' : '$0'}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user.is_premium ? 'per month' : 'forever'}
                </div>
              </div>
            </div>
            
            {user.is_premium && (
              <div className="mt-4 pt-4 border-t border-gray-200/20">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className={`${
            theme === 'dark' 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/70 border-gray-200/50'
          } backdrop-blur-sm ${!user.is_premium ? 'ring-2 ring-purple-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Free Plan</CardTitle>
                {!user.is_premium && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <div className="text-3xl font-bold">$0</div>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Perfect for getting started
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Up to 5 links
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Basic themes
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Mobile optimized
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`relative ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/50'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
          } backdrop-blur-sm ${user.is_premium ? 'ring-2 ring-purple-500' : ''}`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  BioLink Pro
                  <Crown className="h-5 w-5 ml-2 text-yellow-500" />
                </CardTitle>
                {user.is_premium && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <div className="text-3xl font-bold">$9.99</div>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Everything you need to succeed
              </p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  <strong>Unlimited links</strong>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  <strong>Premium themes & customization</strong>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  <strong>Advanced analytics</strong>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  QR code generator
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Custom domains
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Remove BioLink Pro branding
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  Advanced animations
                </li>
              </ul>

              {!user.is_premium && (
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600  text-white border-0"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <Card className={`${
          theme === 'dark' 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/70 border-gray-200/50'
        } backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free</th>
                    <th className="text-center py-3 px-4">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className={`border-b ${
                      theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                    }`}>
                      <td className="py-3 px-4 font-medium">
                        {feature.pro.replace('Unlimited ', '').replace('Advanced ', '').replace('Premium ', '')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {feature.free}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-purple-600">
                          {feature.pro}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                We accept all major credit cards, PayPal, and other payment methods through our secure payment processor.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Do you offer refunds?</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Can I upgrade or downgrade my plan?</h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Yes, you can change your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
