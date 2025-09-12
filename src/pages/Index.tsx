import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, ChevronDown, ChevronUp, MessageSquare, Hash, Users, Camera, Globe } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  site: string;
  icon: React.ReactNode;
  color: string;
}

interface PhraseCategory {
  title: string;
  phrases: string[];
  isOpen: boolean;
}

const platforms: Platform[] = [
  {
    id: 'reddit',
    name: 'Reddit',
    site: 'site:reddit.com',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'discord',
    name: 'Discord',
    site: 'site:discord.gg',
    icon: <Hash className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    site: 'site:twitter.com OR site:x.com',
    icon: <Globe className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    site: 'site:instagram.com',
    icon: <Camera className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    site: 'site:facebook.com',
    icon: <Users className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  }
];

const initialPhraseCategories: PhraseCategory[] = [
  {
    title: 'Personal Expressions',
    isOpen: true,
    phrases: [
      'I think', 'I feel', 'I was', 'I have been', 'I experienced',
      'my experience', 'in my opinion', 'IMO', 'my advice'
    ]
  },
  {
    title: 'Learning Moments',
    isOpen: false,
    phrases: [
      'I found that', 'I learned', 'I realized', 'what I wish I knew',
      'what I regret', 'my biggest mistake'
    ]
  },
  {
    title: 'Problems & Struggles',
    isOpen: false,
    phrases: [
      'struggles', 'problems', 'issues', 'challenge', 'difficulties',
      'hardships', 'pain point', 'barriers', 'obstacles'
    ]
  },
  {
    title: 'Emotions & Concerns',
    isOpen: false,
    phrases: [
      'concerns', 'frustrations', 'worries', 'hesitations',
      'my biggest struggle', 'my biggest fear'
    ]
  }
];

const Index = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['reddit', 'discord']);
  const [phraseCategories, setPhraseCategories] = useState<PhraseCategory[]>(initialPhraseCategories);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [mainTopic, setMainTopic] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const [lastLinks, setLastLinks] = useState<{ name: string; url: string }[]>([]);

  // Update query whenever inputs change
  useEffect(() => {
    generateQuery();
  }, [selectedPlatforms, selectedPhrases, mainTopic, additionalKeywords, searchEngine]);

  // Persist search engine preference
  useEffect(() => {
    try {
      localStorage.setItem('cpprt_engine', searchEngine);
    } catch {}
  }, [searchEngine]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cpprt_engine') as 'google' | 'duckduckgo' | 'bing' | null;
      if (saved) setSearchEngine(saved);
    } catch {}
  }, []);

  // Basic SEO for the tool
  useEffect(() => {
    const title = 'Customer Pain Point Research Tool | Social Research Query Builder';
    document.title = title;

    const desc = 'Build advanced social research queries across Reddit, Discord, Twitter, Instagram, and Facebook.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const generateQuery = () => {
    if (!mainTopic.trim()) {
      setGeneratedQuery('Please enter a main topic to generate a search query');
      return;
    }

    const topicPart = `"${mainTopic.trim()}"`;
    const keywordsPart = additionalKeywords.trim() ? ` AND "${additionalKeywords.trim()}"` : '';

    const platformParts = selectedPlatforms
      .map(platformId => platforms.find(p => p.id === platformId)?.site)
      .filter(Boolean) as string[];

    const platformQuery = platformParts.length > 0 ? ` (${platformParts.join(' OR ')})` : '';

    const phraseJoiner = searchEngine === 'google' ? '|' : ' OR ';
    const phraseQuery = selectedPhrases.length > 0
      ? ` (${selectedPhrases.map(phrase => `"${phrase}"`).join(phraseJoiner)})`
      : '';

    const query = `${topicPart}${keywordsPart}${platformQuery}${phraseQuery}`;
    setGeneratedQuery(query);
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleCategory = (categoryIndex: number) => {
    setPhraseCategories(prev => 
      prev.map((category, index) => 
        index === categoryIndex 
          ? { ...category, isOpen: !category.isOpen }
          : category
      )
    );
  };

  const togglePhrase = (phrase: string) => {
    setSelectedPhrases(prev => 
      prev.includes(phrase)
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    );
  };

  const handleSearch = () => {
    if (!mainTopic.trim() || selectedPlatforms.length === 0) {
      toast({ title: 'Missing info', description: 'Please enter a main topic and select at least one platform.' });
      return;
    }

    const phraseJoiner = searchEngine === 'google' ? '|' : ' OR ';
    const topicPart = `"${mainTopic.trim()}"`;
    const keywordsPart = additionalKeywords.trim() ? ` AND "${additionalKeywords.trim()}"` : '';
    const phrasePart = selectedPhrases.length > 0
      ? ` (${selectedPhrases.map(p => `"${p}"`).join(phraseJoiner)})`
      : '';

    const links: { name: string; url: string }[] = [];

    const engineBase = {
      google: 'https://www.google.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      bing: 'https://www.bing.com/search?q=',
    }[searchEngine];

    // Open one tab per selected platform
    selectedPlatforms.forEach((platformId) => {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform) return;
      const perPlatformQuery = `${topicPart}${keywordsPart} (${platform.site})${phrasePart}`;
      const url = `${engineBase}${encodeURIComponent(perPlatformQuery)}`;
      links.push({ name: platform.name, url });
      try {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (!w) {
          // Popup blocked
          console.warn('Popup blocked for', url);
        }
      } catch (e) {
        console.error('Failed to open window', e);
      }
    });

    setLastLinks(links);

    // If running in sandbox where Google is blocked, guide the user
    toast({
      title: 'Links ready',
      description: `If new tabs didn\'t open, use the quick links below or switch engine to DuckDuckGo/Bing.`,
    });
  };
  const clearAllPhrases = () => {
    setSelectedPhrases([]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Customer Pain Point Research Tool
            </h1>
            <p className="text-muted-foreground text-lg">
              Build advanced Google search queries to discover customer insights across social platforms
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Platform Selection & Phrases */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-research-blue" />
                  Select Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-research-blue-light cursor-pointer transition-all duration-200"
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <div className="flex items-center space-x-2">
                        <span className={platform.color}>{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Selected: {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            {/* Search Phrase Builder */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-research-blue" />
                    Search Phrase Builder
                  </CardTitle>
                  {selectedPhrases.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAllPhrases}>
                      Clear All ({selectedPhrases.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {phraseCategories.map((category, categoryIndex) => (
                  <Collapsible
                    key={category.title}
                    open={category.isOpen}
                    onOpenChange={() => toggleCategory(categoryIndex)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 bg-research-gray rounded-lg hover:bg-research-blue-light transition-colors">
                        <h3 className="font-semibold text-left">{category.title}</h3>
                        {category.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-white rounded-lg border border-border">
                        {category.phrases.map((phrase) => (
                          <Badge
                            key={phrase}
                            variant={selectedPhrases.includes(phrase) ? "default" : "secondary"}
                            className="cursor-pointer justify-center py-2 px-3 hover:scale-105 transition-transform"
                            onClick={() => togglePhrase(phrase)}
                          >
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* Custom Input Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-research-blue" />
                  Research Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mainTopic" className="text-sm font-medium mb-2 block">
                    Main Topic <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mainTopic"
                    value={mainTopic}
                    onChange={(e) => setMainTopic(e.target.value)}
                    placeholder="e.g., project management software, meal planning apps, fitness tracking..."
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="additionalKeywords" className="text-sm font-medium mb-2 block">
                    Additional Keywords <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="additionalKeywords"
                    value={additionalKeywords}
                    onChange={(e) => setAdditionalKeywords(e.target.value)}
                    placeholder="e.g., small business, beginners, affordable..."
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search Engine</Label>
                  <Select value={searchEngine} onValueChange={(v) => setSearchEngine(v as 'google' | 'duckduckgo' | 'bing')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Google" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                      <SelectItem value="bing">Bing</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">If Google is blocked, choose DuckDuckGo or Bing.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Query Preview & Search */}
          <div className="space-y-6">
            {/* Query Preview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-research-blue" />
                  Generated Query
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-research-gray p-4 rounded-lg font-mono text-sm break-all border border-border">
                  {generatedQuery || 'Enter a main topic to see the generated query...'}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  This query will be used to search {searchEngine === 'google' ? 'Google' : searchEngine === 'duckduckgo' ? 'DuckDuckGo' : 'Bing'} for relevant discussions
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!generatedQuery) return;
                      navigator.clipboard.writeText(generatedQuery);
                      toast({ title: 'Copied', description: 'Search query copied to clipboard.' });
                    }}
                  >
                    Copy Query
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Button */}
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <Button
                  variant="research"
                  size="lg"
                  className="w-full"
                  onClick={handleSearch}
                  disabled={!mainTopic.trim() || selectedPlatforms.length === 0}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Now
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Opens {searchEngine === 'google' ? 'Google' : searchEngine === 'duckduckgo' ? 'DuckDuckGo' : 'Bing'} results in new tabs — one per platform
                </p>
                {lastLinks.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Quick links (use if pop-ups or Google are blocked):</p>
                    <div className="flex flex-col gap-2">
                      {lastLinks.map(link => (
                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-foreground/80 hover:text-foreground">
                          {link.name} — open search
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Search Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Platforms:</span>
                  <div className="mt-1">
                    {selectedPlatforms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPlatforms.map(platformId => {
                          const platform = platforms.find(p => p.id === platformId);
                          return platform ? (
                            <Badge key={platformId} variant="secondary" className="text-xs">
                              {platform.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Phrases:</span>
                  <div className="mt-1">
                    {selectedPhrases.length > 0 ? (
                      <span className="text-sm">{selectedPhrases.length} selected</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Customer Pain Point Research Tool. Built for researchers, marketers, and founders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;