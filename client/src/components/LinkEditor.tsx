
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  X
} from 'lucide-react';
import type { User, Link as LinkType, UpdateLinkInput } from '../../../server/src/schema';

interface LinkEditorProps {
  user: User;
  theme: 'light' | 'dark';
  onNavigate: (view: 'dashboard' | 'editor' | 'analytics' | 'billing' | 'preview', username?: string) => void;
}

interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  description: string;
}

export function LinkEditor({ user, theme, onNavigate }: LinkEditorProps) {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    icon: '',
    description: ''
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
      is_active: false,
      click_count: 312,
      created_at: new Date(),
      updated_at: new Date()
    }
  ], [user.id]);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load links from API
      setLinks(demoLinks);
    } catch (error) {
      console.error('Failed to load links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [demoLinks]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const resetForm = () => {
    setFormData({ title: '', url: '', icon: '', description: '' });
    setEditingLink(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLink) {
        // Update existing link
        const updateData: UpdateLinkInput = {
          id: editingLink,
          title: formData.title,
          url: formData.url,
          icon: formData.icon || null,
          description: formData.description || null
        };
        
        // Update link in state
        setLinks(prev => prev.map((link: LinkType) => 
          link.id === editingLink 
            ? { ...link, ...updateData, updated_at: new Date() }
            : link
        ));
      } else {
        // Create new link - explicitly handle nullable fields
        const iconValue: string | null = formData.icon || null;
        const descriptionValue: string | null = formData.description || null;
        
        const newLink: LinkType = {
          id: `link-${Date.now()}`,
          user_id: user.id,
          title: formData.title,
          url: formData.url,
          icon: iconValue,
          description: descriptionValue,
          order_index: links.length,
          is_active: true,
          click_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        setLinks(prev => [...prev, newLink]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save link:', error);
    }
  };

  const handleEdit = (link: LinkType) => {
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon || '',
      description: link.description || ''
    });
    setEditingLink(link.id);
    setShowAddForm(true);
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      // Delete link from state
      setLinks(prev => prev.filter((link: LinkType) => link.id !== linkId));
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const toggleLinkActive = async (linkId: string) => {
    try {
      // Toggle link active status
      setLinks(prev => prev.map((link: LinkType) => 
        link.id === linkId 
          ? { ...link, is_active: !link.is_active, updated_at: new Date() }
          : link
      ));
    } catch (error) {
      console.error('Failed to toggle link:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, linkId: string) => {
    setDraggedItem(linkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;
    
    const draggedIndex = links.findIndex((link: LinkType) => link.id === draggedItem);
    const targetIndex = links.findIndex((link: LinkType) => link.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newLinks = [...links];
    const [draggedLink] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLink);
    
    // Update order indices
    const updatedLinks = newLinks.map((link: LinkType, index: number) => ({
      ...link,
      order_index: index
    }));
    
    setLinks(updatedLinks);
    setDraggedItem(null);
    
    // In real app, this would call reorderLinks API
  };

  const linkLimit = user.is_premium ? Infinity : 5;
  const canAddMore = links.length < linkLimit;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Link Editor</h1>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your links an              d customize your bio page
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={() => onNavigate('preview', user.username)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Links List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Link Button */}
            <Card className={`${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/70 border-gray-200/50'
            } backdrop-blur-sm`}>
              <CardContent className="p-6">
                {!showAddForm ? (
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    disabled={!canAddMore}
                    className="w-full h-16 border-2 border-dashed border-gray-300 bg-transparent hover:bg-gray-50 hover:border-gray-400 text-gray-600 hover:text-gray-800"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {canAddMore ? 'Add New Link' : `Link limit reached (${linkLimit})`}
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingLink ? 'Edit Link' : 'Add New Link'}
                      </h3>
                      <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData(prev => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g., My Website"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icon">Icon</Label>
                        <Input
                          id="icon"
                          value={formData.icon}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData(prev => ({ ...prev, icon: e.target.value }))
                          }
                          placeholder="🌐"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url">URL *</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData(prev => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="https://example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setFormData(prev => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Optional description for your link"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        {editingLink ? 'Update Link' : 'Add Link'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Existing Links */}
            <Card className={`${
              theme === 'dark' 
                ? 'bg-gray-800/50 border-gray-700/50' 
                : 'bg-white/70 border-gray-200/50'
            } backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Your Links
                  <Badge variant="secondary" className="ml-2">
                    {links.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-20 rounded-lg animate-pulse ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                ) : links.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No links yet. Add your first link above!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link: LinkType) => (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, link.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, link.id)}
                        className={`flex items-center p-4 rounded-lg border transition-all hover:shadow-md ${
                          theme === 'dark'
                            ? 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
                            : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                        } ${draggedItem === link.id ? 'opacity-50' : ''} cursor-move`}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <GripVertical className={`h-5 w-5 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        </div>

                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold mr-4">
                          {link.icon || link.title.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{link.title}</h4>
                            {!link.is_active && (
                              <Badge variant="outline" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm truncate ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {link.description || link.url}
                          </p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {link.click_count} clicks
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLinkActive(link.id)}
                          >
                            {link.is_active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(link)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(link.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className={`${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white/70 border-gray-200/50'
              } backdrop-blur-sm`}>
                <CardHeader>
                  <CardTitle className="text-center">Live Preview</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className={`rounded-lg p-6 ${
                    theme === 'dark'
                      ? 'bg-gray-900/50'
                      : 'bg-gray-50/50'
                  }`}>
                    {/* Profile section */}
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {(user.display_name || user.username).charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-xl font-bold">{user.display_name || user.username}</h2>
                      {user.bio && (
                        <p className={`text-sm mt-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {user.bio}
                        </p>
                      )}
                    </div>

                    {/* Preview links */}
                    <div className="space-y-3">
                      {links.filter((link: LinkType) => link.is_active).map((link: LinkType) => (
                        <div
                          key={link.id}
                          className={`p-4 rounded-lg border text-center transition-transform hover:scale-105 ${
                            theme === 'dark'
                              ? 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {link.icon && (
                              <span className="text-lg mr-2">{link.icon}</span>
                            )}
                            <span className="font-medium">{link.title}</span>
                          </div>
                          {link.description && (
                            <p className={`text-xs mt-1 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {link.description}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {links.filter((link: LinkType) => link.is_active).length === 0 && (
                        <p className={`text-center text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No active links to display
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
