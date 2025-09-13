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
import { Search, ChevronDown, ChevronUp, MessageSquare, Hash, Users, Camera, Globe, Briefcase, Play, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    id: 'facebook',
    name: 'Facebook',
    site: 'site:facebook.com',
    icon: <Users className="w-4 h-4" />,
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
    id: 'linkedin',
    name: 'LinkedIn',
    site: 'site:linkedin.com',
    icon: <Briefcase className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    site: 'site:reddit.com',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    site: 'site:twitter.com',
    icon: <Globe className="w-4 h-4" />,
    color: 'text-research-blue-dark'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    site: 'site:youtube.com',
    icon: <Play className="w-4 h-4" />,
    color: 'text-research-accent'
  },
  {
    id: 'google-trends',
    name: 'Google Trends',
    site: '', // Special handling in search function
    icon: <TrendingUp className="w-4 h-4" />,
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

// Google Trends categories for targeted search
const googleTrendsCategories = [
  { id: '0', name: 'All Categories' },
  { id: '3', name: 'Arts & Entertainment' },
  { id: '5', name: 'Computers & Electronics' },
  { id: '7', name: 'Finance' },
  { id: '8', name: 'Games' },
  { id: '11', name: 'Home & Garden' },
  { id: '12', name: 'Internet & Telecom' },
  { id: '13', name: 'Jobs & Education' },
  { id: '14', name: 'Law & Government' },
  { id: '16', name: 'News' },
  { id: '17', name: 'Online Communities' },
  { id: '18', name: 'People & Society' },
  { id: '19', name: 'Pets & Animals' },
  { id: '20', name: 'Real Estate' },
  { id: '22', name: 'Science' },
  { id: '23', name: 'Sports' },
  { id: '24', name: 'Travel' },
  { id: '1237', name: 'Business & Industrial' },
  { id: '45', name: 'Health' },
  { id: '299', name: 'Shopping' }
];

const Index = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [phraseCategories, setPhraseCategories] = useState<PhraseCategory[]>(initialPhraseCategories);
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [mainTopic, setMainTopic] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'duckduckgo' | 'bing'>('google');
  const [timeFilter, setTimeFilter] = useState<'any' | 'hour' | 'day' | 'week' | 'month' | 'year'>('any');
  const [googleTrendsCategory, setGoogleTrendsCategory] = useState<string>('0');
  const [lastLinks, setLastLinks] = useState<{ name: string; url: string; display: string }[]>([]);

  // Update query whenever inputs change
  useEffect(() => {
    generateQuery();
  }, [selectedPlatforms, selectedPhrases, mainTopic, additionalKeywords, searchEngine, timeFilter]);

  // Basic SEO for the tool
  useEffect(() => {
    const title = 'Customer Pain Point Research Tool | Social Research Query Builder';
    document.title = title;

    const desc = 'Build advanced social research queries across Reddit, YouTube, Twitter, Instagram, Facebook, and LinkedIn.';
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

    // Keep the combined query for preview, but build individual platform queries for search
    const platformTokens = selectedPlatforms
      .map((platformId) => {
        if (platformId === 'reddit') return 'site:reddit.com inurl:comments|inurl:thread';
        const siteStr = platforms.find((p) => p.id === platformId)?.site ?? '';
        return siteStr.replace(/\s+OR\s+/g, '|');
      })
      .filter(Boolean) as string[];

    // phrases with single intext prefix
    const phrasesToken = selectedPhrases.length > 0 ? `intext:"${selectedPhrases.join('"|"')}"` : '';

    const groupedContent = [platformTokens.join(' | '), phrasesToken].filter(Boolean).join(' | ');

    const query = groupedContent ? `${topicPart}${keywordsPart} (${groupedContent})` : `${topicPart}${keywordsPart}`;

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

    const engineBase = {
      google: 'https://www.google.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
      bing: 'https://www.bing.com/search?q=',
    }[searchEngine];

    const links: { name: string; url: string; display: string }[] = [];

    // Open one tab per platform with individual platform queries
    selectedPlatforms.forEach((platformId) => {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform) return;

      // Special handling for Google Trends
      if (platformId === 'google-trends') {
        const trendsQuery = encodeURIComponent(mainTopic.trim());
        const categoryParam = googleTrendsCategory !== '0' ? `&cat=${googleTrendsCategory}` : '';
        const trendsUrl = `https://trends.google.com/trends/explore?date=all&q=${trendsQuery}${categoryParam}&hl=en`;
        const categoryName = googleTrendsCategories.find(c => c.id === googleTrendsCategory)?.name || 'All Categories';
        const display = `Google Trends: ${mainTopic.trim()} (${categoryName})`;
        
        links.push({ name: platform.name, url: trendsUrl, display });

        try {
          const w = window.open(trendsUrl, '_blank', 'noopener,noreferrer');
          if (!w) {
            console.warn('Popup blocked for', trendsUrl);
          }
        } catch (e) {
          console.error('Failed to open window', e);
        }
        return;
      }

      const topicPart = `"${mainTopic.trim()}"`;
      const keywordsPart = additionalKeywords.trim() ? ` AND "${additionalKeywords.trim()}"` : '';
      
      // Build platform-specific query
      let platformToken = '';
      if (platformId === 'reddit') {
        platformToken = 'site:reddit.com inurl:comments|inurl:thread';
      } else if (platformId === 'discord') {
        platformToken = 'site:discord.com OR site:discord.gg OR site:disboard.org';
      } else if (platformId === 'twitter') {
        platformToken = 'site:twitter.com';
      } else if (platformId === 'linkedin') {
        platformToken = 'site:linkedin.com';
      } else {
        platformToken = platform.site.replace(/\s+OR\s+/g, '|');
      }

      const phrasesToken = selectedPhrases.length > 0 ? `intext:"${selectedPhrases.join('"|"')}"` : '';
      const groupedContent = [platformToken, phrasesToken].filter(Boolean).join(' ');
      const platformQuery = groupedContent ? `${topicPart}${keywordsPart} (${groupedContent})` : `${topicPart}${keywordsPart}`;

      // Build URL with time filter for Google
      let baseUrl = searchEngine === 'google'
        ? `${engineBase}${platformQuery.replace(/\s/g, '+')}`
        : `${engineBase}${encodeURIComponent(platformQuery)}`;
      
      // Add time filter parameter for Google
      if (searchEngine === 'google' && timeFilter !== 'any') {
        const timeParams = {
          hour: 'qdr:h',
          day: 'qdr:d', 
          week: 'qdr:w',
          month: 'qdr:m',
          year: 'qdr:y'
        };
        baseUrl += `&tbs=${timeParams[timeFilter]}`;
      }

      const url = baseUrl;
      const display = `${engineBase}${platformQuery}`;

      links.push({ name: platform.name, url, display });

      try {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (!w) {
          console.warn('Popup blocked for', url);
        }
      } catch (e) {
        console.error('Failed to open window', e);
      }
    });

    setLastLinks(links);

    toast({
      title: 'Search initiated',
      description: `Opening ${selectedPlatforms.length} ${searchEngine} tab${selectedPlatforms.length !== 1 ? 's' : ''}`,
    });
  };
  const clearAllPhrases = () => {
    setSelectedPhrases([]);
    // Close all dropdowns when clearing
    setPhraseCategories(prev => 
      prev.map(category => ({ ...category, isOpen: false }))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Customer Pain Point Research Tool
              </h1>
              <p className="text-muted-foreground">
                Build advanced search queries to discover customer insights across social platforms
              </p>
            </div>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Topic, Phrases & Filters */}
          <div className="lg:col-span-3 space-y-4">
            {/* Main Topic and Keywords */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Hash className="w-7 h-7 text-research-blue" />
                  Research Topic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="mainTopic" className="text-sm font-medium mb-2 block">
                    Main Topic <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="mainTopic"
                      value={mainTopic}
                      onChange={(e) => setMainTopic(e.target.value)}
                      placeholder="e.g., project management software, meal planning apps, fitness tracking..."
                      className="flex-1"
                    />
                    <Button
                      variant="research"
                      size="sm"
                      onClick={handleSearch}
                      disabled={!mainTopic.trim() || selectedPlatforms.length === 0}
                      className="px-4"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Search
                    </Button>
                  </div>
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
              </CardContent>
            </Card>

            {/* Search Phrase Builder */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
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
              <CardContent className="space-y-3">
                {phraseCategories.map((category, categoryIndex) => (
                  <Collapsible
                    key={category.title}
                    open={category.isOpen}
                    onOpenChange={() => toggleCategory(categoryIndex)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-2 bg-research-gray rounded-lg hover:bg-research-blue-light transition-colors">
                        <h3 className="font-semibold text-left text-sm">{category.title}</h3>
                        {category.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 bg-white rounded-lg border border-border">
                        {category.phrases.map((phrase) => (
                          <Badge
                            key={phrase}
                            variant={selectedPhrases.includes(phrase) ? "default" : "secondary"}
                            className="cursor-pointer justify-center py-1 px-2 hover:scale-105 transition-transform text-xs"
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

            {/* Search Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5 text-research-blue" />
                  Search Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Time Filter</Label>
                    <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="hour">Past hour</SelectItem>
                        <SelectItem value="day">Past 24 hours</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Filter results by time (Google only).</p>
                  </div>
                </div>
                
                {/* Google Trends Category Selection - only show when Google Trends is selected */}
                {selectedPlatforms.includes('google-trends') && (
                  <div className="pt-3 border-t border-border">
                    <Label className="text-sm font-medium mb-2 block">Google Trends Category</Label>
                    <Select value={googleTrendsCategory} onValueChange={setGoogleTrendsCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {googleTrendsCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Choose a category to get more targeted trends data for your topic.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Platform Selection & Search */}
          <div className="space-y-4">
            {/* Platform Selection */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-research-blue" />
                  Select Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {platforms.map((platform) => {
                    const platformElement = (
                      <label
                        key={platform.id}
                        className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-research-blue-light cursor-pointer transition-all duration-200"
                      >
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <div className="flex items-center space-x-1">
                          <span className={platform.color}>{platform.icon}</span>
                          <span className="font-medium text-sm">{platform.name}</span>
                        </div>
                      </label>
                    );

                    if (platform.id === 'google-trends') {
                      return (
                        <Tooltip key={platform.id}>
                          <TooltipTrigger asChild>
                            {platformElement}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Uses Main Topic only! You'll have to change on Google Trends tab to Topic not Search term.</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return platformElement;
                  })}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Selected: {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>

            {/* Search Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Search Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
                      <span className="text-xs text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Phrases:</span>
                  <div className="mt-1">
                    {selectedPhrases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPhrases.map(phrase => (
                          <Badge key={phrase} variant="outline" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Generated Query:</span>
                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-words">
                    {generatedQuery || "Enter a main topic to generate a query"}
                  </div>
                </div>
                {lastLinks.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Quick Links:</span>
                    <p className="text-xs text-muted-foreground mb-2">Use if pop-ups are blocked:</p>
                     <div className="flex flex-col gap-1">
                       {lastLinks.map(link => {
                         // Create abbreviated display URL
                         let abbreviatedUrl = '';
                         if (searchEngine === 'google') {
                           abbreviatedUrl = `www.google.com/${link.name.toLowerCase()}...`;
                         } else if (searchEngine === 'bing') {
                           abbreviatedUrl = `www.bing.com/${link.name.toLowerCase()}...`;
                         } else if (searchEngine === 'duckduckgo') {
                           abbreviatedUrl = `duckduckgo.com/${link.name.toLowerCase()}...`;
                         }
                         
                         return (
                           <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-foreground/80 hover:text-foreground">
                             {link.name}: {abbreviatedUrl}
                           </a>
                         );
                       })}
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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