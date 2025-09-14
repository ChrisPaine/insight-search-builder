import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Search, ChevronDown, ChevronUp, MessageSquare, Hash, Users, Camera, Globe, Briefcase, Play, TrendingUp, Settings, Save, FolderOpen, User, LogOut, Crown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { PaywallDialog } from '@/components/paywall/PaywallDialog';
import { SavedQueriesDialog } from '@/components/queries/SavedQueriesDialog';
import { useQueries } from '@/hooks/useQueries';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import researchMascot from '@/assets/research-mascot.png';

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
    isOpen: false,
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

// Preset configurations for different research goals
const phrasePresets = [
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Personal opinions and emotional responses',
    categories: [0, 3] // Personal Expressions + Emotions & Concerns
  },
  {
    id: 'user-research',
    name: 'User Research', 
    description: 'Learning experiences and challenges',
    categories: [1, 2] // Learning Moments + Problems & Struggles
  },
  {
    id: 'pain-discovery',
    name: 'Pain Point Discovery',
    description: 'Problems and emotional concerns',
    categories: [2, 3] // Problems & Struggles + Emotions & Concerns
  },
  {
    id: 'experience-insights',
    name: 'Experience Insights',
    description: 'Personal experiences and learnings',
    categories: [0, 1] // Personal Expressions + Learning Moments
  },
  {
    id: 'complete-research',
    name: 'Complete Research',
    description: 'All phrase categories',
    categories: [0, 1, 2, 3] // All categories
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
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [lastLinks, setLastLinks] = useState<{ name: string; url: string; display: string }[]>([]);

  // Auth and paywall state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [paywallDialogOpen, setPaywallDialogOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [savedQueriesDialogOpen, setSavedQueriesDialogOpen] = useState(false);
  const [saveQueryTitle, setSaveQueryTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  
  const { user, signOut, isPro, isPremium, isSupabaseConnected } = useAuth();
  const { saveQuery } = useQueries();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [additionalKeywordsOpen, setAdditionalKeywordsOpen] = useState(false);
  const [redditAdvancedOpen, setRedditAdvancedOpen] = useState(false);
  const [spotlightTick, setSpotlightTick] = useState(0);

  const tutorialSteps = [
    {
      target: '#main-topic',
      title: 'Step 1: Enter Your Research Topic',
      content: 'Start by entering the main topic or market you want to research. For example: "SaaS tools", "fitness apps", or "productivity software".',
      position: 'bottom'
    },
    {
      target: '#platform-selector',
      title: 'Step 2: Choose Platforms',
      content: 'Select which social media platforms to search. Each platform has unique advanced options for better targeting. Let me show you Reddit\'s advanced features!',
      position: 'right',
      action: () => {
        setSelectedPlatforms(['reddit']);
        // Recalculate spotlight after expansion so the whole card is highlighted
        setTimeout(() => setSpotlightTick((t) => t + 1), 400);
      }
    },
    {
      target: '#advanced-options',
      title: 'Step 3: Platform Advanced Features',
      content: 'Each platform offers powerful advanced options! Reddit lets you target self-posts, high-engagement content, specific users, and more. These help find the most relevant pain points.',
      position: 'left',
      action: () => {
        setRedditAdvancedOpen(true);
      }
    },
    {
      target: '#additional-keywords',  
      title: 'Step 4: Add Keywords (Optional)',
      content: 'Add specific keywords to narrow down your search. This helps find more targeted pain points.',
      position: 'bottom',
      action: () => {
        setAdditionalKeywordsOpen(true);
        // Recalculate spotlight after expansion
        setTimeout(() => setSpotlightTick((t) => t + 1), 300);
      }
    },
    {
      target: '#phrase-builder',
      title: 'Step 5: Select Pain Point Phrases',
      content: 'Choose from pre-built phrase categories that help identify customer pain points, or select a preset for quick setup.',
      position: 'right'
    },
    {
      target: '#search-settings',
      title: 'Step 6: Configure Search Settings',
      content: 'Choose your search engine, time filter, and access advanced options for each selected platform.',
      position: 'left'
    },
    {
      target: '#search-button',
      title: 'Step 7: Start Your Research',
      content: 'Click to open search tabs for each selected platform. Your query will be automatically optimized for each platform.',
      position: 'top'
    }
  ];
  const nextStep = () => {
    const currentStep = tutorialSteps[tutorialStep];
    
    // Execute current step action if it exists
    if (currentStep.action) {
      currentStep.action();
    }
    
    if (tutorialStep < tutorialSteps.length - 1) {
      const nextStepIndex = tutorialStep + 1;
      setTutorialStep(nextStepIndex);
      
      // Execute next step action immediately when it becomes active
      const nextStep = tutorialSteps[nextStepIndex];
      if (nextStep.action) {
        setTimeout(() => {
          nextStep.action();
        }, 100);
      }
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  // Advanced platform options
  const [advancedOptions, setAdvancedOptions] = useState({
    facebook: {
      groupId: '',
      publicPostsOnly: false,
      communityType: [] as string[]
    },
    reddit: {
      selfPostsOnly: false,
      minScore: false,
      scoreThreshold: 50,
      author: ''
    },
    twitter: {
      verifiedOnly: false,
      hasMedia: false,
      emotionalContent: false,
      communityValidation: false,
      opinions: false,
      rants: false,
      experiences: false,
      searchLists: false,
      searchCommunities: false
    },
    instagram: {
      linkInBio: false,
      swipeUp: false,
      reelsOnly: false
    },
    linkedin: {
      publicPosts: false,
      pulseArticles: false,
      companyPosts: false,
      industrySpecific: false,
      roleBased: false,
      targetRole: 'CEO'
    },
    youtube: {
      commentsSearch: false,
      videoContent: false,
      channelSpecific: false,
      videoReactions: false,
      tutorialFeedback: false,
      productReviews: false,
      longTermReviews: false
    }
  });

  // Update query whenever inputs change
  useEffect(() => {
    generateQuery();
  }, [selectedPlatforms, selectedPhrases, mainTopic, additionalKeywords, searchEngine, timeFilter]);

  // Basic SEO for the tool
  useEffect(() => {
    const title = 'Social media research tool | Social Research Query Builder';
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
        if (platformId === 'reddit') return 'site:reddit.com (inurl:comments OR inurl:thread)';
        const siteStr = platforms.find((p) => p.id === platformId)?.site ?? '';
        return siteStr;
      })
      .filter(Boolean) as string[];

    // phrases with single intext prefix
    const phrasesToken = selectedPhrases.length > 0 ? `intext:("${selectedPhrases.join('" OR "')}")` : '';

    const groupedContent = [platformTokens.join(' OR '), phrasesToken].filter(Boolean).join(' OR ');

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
        platformToken = 'site:reddit.com (inurl:comments OR inurl:thread)';
        
        // Add Reddit advanced options
        const redditOptions = advancedOptions.reddit;
        if (redditOptions.selfPostsOnly) {
          platformToken += ' -inurl:redd.it -inurl:imgur.com -inurl:youtube.com -inurl:twitter.com';
        }
        if (redditOptions.minScore) {
          platformToken += ` score:>${redditOptions.scoreThreshold}`;
        }
        if (redditOptions.author) {
          platformToken += ` author:${redditOptions.author}`;
        }
      } else if (platformId === 'facebook') {
        platformToken = 'site:facebook.com';
        
        // Add Facebook advanced options
        const fbOptions = advancedOptions.facebook;
        if (fbOptions.groupId) {
          platformToken += ` inurl:groups/${fbOptions.groupId}`;
        }
        if (fbOptions.publicPostsOnly) {
          platformToken += ' inurl:posts';
        }
        if (fbOptions.communityType.length > 0) {
          const communityTerms = fbOptions.communityType.map(type => `"${type}"`).join(' OR ');
          platformToken += ` (${communityTerms})`;
        }
      } else if (platformId === 'twitter') {
        platformToken = 'site:twitter.com';
        
        // Add Twitter advanced options using Google-compatible syntax
        const twitterOptions = advancedOptions.twitter;
        
        let twitterTerms = [];
        
        if (twitterOptions.emotionalContent) {
          twitterTerms.push('(struggling OR frustrated OR "wish I knew" OR "biggest mistake")');
        }
        if (twitterOptions.communityValidation) {
          twitterTerms.push('("anyone else" OR "am I the only one" OR "does anyone")');
        }
        if (twitterOptions.opinions) {
          twitterTerms.push('("unpopular opinion" OR "hot take" OR "controversial" OR "I think")');
        }
        if (twitterOptions.rants) {
          twitterTerms.push('(rant OR vent OR frustrated OR angry OR "I hate")');
        }
        if (twitterOptions.experiences) {
          twitterTerms.push('("my experience" OR "my journey" OR "I tried" OR "I learned")');
        }
        if (twitterOptions.verifiedOnly) {
          twitterTerms.push('(verified OR checkmark OR "blue tick")');
        }
        if (twitterOptions.hasMedia) {
          twitterTerms.push('(photo OR image OR video OR pic OR "attached")');
        }
        
        // Combine terms if any are selected
        if (twitterTerms.length > 0) {
          platformToken += ' ' + twitterTerms.join(' ');
        }
      } else if (platformId === 'discord') {
        platformToken = 'site:discord.com OR site:discord.gg OR site:disboard.org';
      } else if (platformId === 'linkedin') {
        platformToken = 'site:linkedin.com';
        
        // Add LinkedIn advanced options
        const linkedinOptions = advancedOptions.linkedin;
        if (linkedinOptions.publicPosts) {
          platformToken = 'site:linkedin.com/posts ("I struggled with" OR "my experience" OR "I learned" OR "pain point" OR "challenge")';
        } else if (linkedinOptions.pulseArticles) {
          platformToken = 'site:linkedin.com/pulse ("I think" OR "my opinion" OR "I found that" OR "biggest challenge")';
        } else if (linkedinOptions.companyPosts) {
          platformToken = 'site:linkedin.com/company ("feedback" OR "review" OR "experience" OR "struggled")';
        } else if (linkedinOptions.industrySpecific) {
          platformToken = 'site:linkedin.com ("I wish" OR "frustration" OR "pain point" OR "challenge" OR "struggled")';
        } else if (linkedinOptions.roleBased) {
          platformToken = `site:linkedin.com ("${linkedinOptions.targetRole}" OR "founder" OR "marketing manager") "biggest challenge"`;
        }
      } else if (platformId === 'instagram') {
        platformToken = 'site:instagram.com';
        
        // Add Instagram advanced options
        const igOptions = advancedOptions.instagram;
        if (igOptions.linkInBio) {
          platformToken += ' intext:"link in bio" ("struggling" OR "journey" OR "help")';
        }
        if (igOptions.swipeUp) {
          platformToken += ' intext:"swipe up" ("honest" OR "real" OR "truth")';
        }
        if (igOptions.reelsOnly) {
          platformToken = 'site:instagram.com/reel ("anyone else" OR "am I the only one" OR "struggle")';
        }
      } else if (platformId === 'youtube') {
        platformToken = 'site:youtube.com';
        
        // Add YouTube advanced options using compatible syntax
        const youtubeOptions = advancedOptions.youtube;
        
        let youtubeTerms = [];
        
        if (youtubeOptions.commentsSearch) {
          youtubeTerms.push('("I tried this" OR "this helped me" OR "I struggled with" OR "my experience")');
        }
        if (youtubeOptions.videoContent) {
          youtubeTerms.push('("review" OR "experience" OR "problems" OR "issues" OR "struggles")');
        }
        if (youtubeOptions.channelSpecific) {
          youtubeTerms.push('("honest review" OR "my thoughts" OR "problems with")');
        }
        if (youtubeOptions.videoReactions) {
          youtubeTerms.push('("this saved my life" OR "game changer" OR "waste of money" OR "don\'t buy this")');
        }
        if (youtubeOptions.tutorialFeedback) {
          youtubeTerms.push('("this didn\'t work for me" OR "finally something that works" OR "I tried everything")');
        }
        if (youtubeOptions.productReviews) {
          youtubeTerms.push('("honest opinion" OR "pros and cons" OR "before you buy")');
        }
        if (youtubeOptions.longTermReviews) {
          youtubeTerms.push('("long term review" OR "6 month update" OR "1 year later")');
        }
        
        // Combine terms with OR logic to be less restrictive
        if (youtubeTerms.length > 0) {
          platformToken += ' (' + youtubeTerms.join(' OR ') + ')';
        }
      } else {
        platformToken = platform.site;
      }

      const phrasesToken = selectedPhrases.length > 0 ? `intext:("${selectedPhrases.join('" OR "')}")` : '';
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
    setSelectedPreset(''); // Reset preset dropdown
    // Close all dropdowns when clearing
    setPhraseCategories(prev => 
      prev.map(category => ({ ...category, isOpen: false }))
    );
  };

  const handleSaveQuery = async () => {
    // For demo purposes, allow saving without Supabase
    if (!isSupabaseConnected) {
      toast({ 
        title: 'Demo Mode', 
        description: 'Query saving is a premium feature available with Supabase connection.' 
      });
      return;
    }
    
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    if (!isPro) {
      setPaywallFeature('save queries');
      setPaywallDialogOpen(true);
      return;
    }

    if (!saveQueryTitle.trim()) {
      toast({
        title: 'Please enter a title',
        description: 'A title is required to save your query.',
        variant: 'destructive',
      });
      return;
    }

    const queryData = {
      selectedPlatforms,
      selectedPhrases,
      mainTopic,
      additionalKeywords,
      generatedQuery,
      searchEngine,
      timeFilter,
    };

    const saved = await saveQuery(saveQueryTitle, queryData, selectedPlatforms);
    if (saved) {
      toast({
        title: 'Query saved!',
        description: `"${saveQueryTitle}" has been saved to your queries.`,
      });
      setSaveQueryTitle('');
      setShowSaveInput(false);
    } else {
      toast({
        title: 'Error saving query',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLoadQuery = (queryData: any, platforms: string[]) => {
    setSelectedPlatforms(platforms);
    setSelectedPhrases(queryData.selectedPhrases || []);
    setMainTopic(queryData.mainTopic || '');
    setAdditionalKeywords(queryData.additionalKeywords || '');
    setSearchEngine(queryData.searchEngine || 'google');
    setTimeFilter(queryData.timeFilter || 'any');
  };

  const checkFeatureAccess = (feature: string) => {
    // For demo purposes, show premium dialogs instead of requiring connection
    if (!isSupabaseConnected) {
      setPaywallFeature(feature);
      setPaywallDialogOpen(true);
      return false;
    }
    
    if (!user) {
      setAuthDialogOpen(true);
      return false;
    }
    
    if (!isPro && (feature === 'export' || feature === 'advanced-operators')) {
      setPaywallFeature(feature);
      setPaywallDialogOpen(true);
      return false;
    }
    
    return true;
  };

  const applyPreset = (presetId: string) => {
    const preset = phrasePresets.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId); // Track selected preset

    // Clear existing selections first
    setSelectedPhrases([]);
    
    // Open selected categories and select all their phrases
    setPhraseCategories(prev => 
      prev.map((category, index) => ({
        ...category,
        isOpen: preset.categories.includes(index)
      }))
    );

    // Select all phrases from the preset categories
    const newSelectedPhrases: string[] = [];
    preset.categories.forEach(categoryIndex => {
      if (initialPhraseCategories[categoryIndex]) {
        newSelectedPhrases.push(...initialPhraseCategories[categoryIndex].phrases);
      }
    });
    
    setSelectedPhrases(newSelectedPhrases);
  };

  const clearAll = () => {
    // Reset all form inputs
    setMainTopic('');
    setAdditionalKeywords('');
    
    // Reset phrase builder
    setSelectedPhrases([]);
    setSelectedPreset('');
    setPhraseCategories(initialPhraseCategories.map(category => ({ ...category, isOpen: false })));
    
    // Reset platforms
    setSelectedPlatforms([]);
    
    // Reset search settings
    setSearchEngine('google');
    setTimeFilter('any');
    setGoogleTrendsCategory('0');
    
    // Reset advanced options
    setAdvancedOptions({
      facebook: {
        groupId: '',
        publicPostsOnly: false,
        communityType: []
      },
      reddit: {
        selfPostsOnly: false,
        minScore: false,
        scoreThreshold: 50,
        author: ''
      },
      twitter: {
        verifiedOnly: false,
        hasMedia: false,
        emotionalContent: false,
        communityValidation: false,
        opinions: false,
        rants: false,
        experiences: false,
        searchLists: false,
        searchCommunities: false
      },
      instagram: {
        linkInBio: false,
        swipeUp: false,
        reelsOnly: false
      },
      linkedin: {
        publicPosts: false,
        pulseArticles: false,
        companyPosts: false,
        industrySpecific: false,
        roleBased: false,
        targetRole: 'CEO'
      },
      youtube: {
        commentsSearch: false,
        videoContent: false,
        channelSpecific: false,
        videoReactions: false,
        tutorialFeedback: false,
        productReviews: false,
        longTermReviews: false
      }
    });
    
    toast({
      title: 'Cleared',
      description: 'All settings reset to default'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSavedQueriesDialogOpen(true)}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Saved Queries
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-4 mb-1">
                {/* Left side icons */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
                  </div>
                  <div className="w-6 h-6 bg-blue-700 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mx-4">
                  Social Media Research Tool
                </h1>
                
                {/* Right side icons */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">r/</span>
                  </div>
                  <div className="w-6 h-6 bg-blue-400 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">X</span>
                  </div>
                  <div className="w-6 h-6 bg-red-600 rounded-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[4px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Build advanced search queries to discover customer insights across social platforms
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                Help Tour
              </Button>
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  {isPro && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Crown className="w-3 h-3 mr-1" />
                      {isPremium ? 'Premium' : 'Pro'}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-2xl border-b border-border pb-2">
                    <Hash className="w-7 h-7 text-research-blue" />
                    Research Topic
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {user && (
                      <>
                        {showSaveInput ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              placeholder="Query title..."
                              value={saveQueryTitle}
                              onChange={(e) => setSaveQueryTitle(e.target.value)}
                              className="w-32 h-8 text-sm"
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveQuery()}
                            />
                            <Button onClick={handleSaveQuery} size="sm" variant="outline">
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setShowSaveInput(false);
                                setSaveQueryTitle('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => setShowSaveInput(true)} 
                            variant="outline" 
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Query
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="mainTopic" className="text-sm font-medium mb-2 block">
                    Main Topic <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="main-topic"
                      value={mainTopic}
                      onChange={(e) => setMainTopic(e.target.value)}
                      placeholder="e.g., 3 evergreen core markets, where people always spend: Health, Wealth, Relationships!"
                      className="flex-1"
                    />
                    <Select onValueChange={(value) => setMainTopic(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select market" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectGroup>
                          <SelectLabel>Health Market</SelectLabel>
                          <SelectItem value="Health">Health</SelectItem>
                          
                          <SelectItem value="Fitness" className="pl-6">• Fitness</SelectItem>
                          <SelectItem value="Strength Training" className="pl-8">• Strength Training</SelectItem>
                          <SelectItem value="Home-Based Strength Training" className="pl-10">• Home-Based Strength Training</SelectItem>
                          <SelectItem value="Strength Training for Postpartum Mothers" className="pl-12">• Strength Training for Postpartum Mothers</SelectItem>
                          <SelectItem value="Strength Training for Seniors" className="pl-12">• Strength Training for Seniors</SelectItem>
                          <SelectItem value="Bodyweight Strength Training" className="pl-10">• Bodyweight Strength Training</SelectItem>
                          <SelectItem value="Bodyweight Training for Travelers" className="pl-12">• Bodyweight Training for Travelers</SelectItem>
                          <SelectItem value="Bodyweight Training for Military Personnel" className="pl-12">• Bodyweight Training for Military Personnel</SelectItem>
                          
                          <SelectItem value="Cardio Fitness" className="pl-8">• Cardio Fitness</SelectItem>
                          <SelectItem value="High-Intensity Interval Training (HIIT)" className="pl-10">• High-Intensity Interval Training (HIIT)</SelectItem>
                          <SelectItem value="HIIT for Busy Professionals" className="pl-12">• HIIT for Busy Professionals</SelectItem>
                          <SelectItem value="HIIT for Weight Loss in Women" className="pl-12">• HIIT for Weight Loss in Women</SelectItem>
                          
                          <SelectItem value="Yoga" className="pl-8">• Yoga</SelectItem>
                          <SelectItem value="Power Yoga" className="pl-10">• Power Yoga</SelectItem>
                          <SelectItem value="Power Yoga for Athletes" className="pl-12">• Power Yoga for Athletes</SelectItem>
                          <SelectItem value="Restorative Yoga" className="pl-10">• Restorative Yoga</SelectItem>
                          <SelectItem value="Restorative Yoga for Stress Relief" className="pl-12">• Restorative Yoga for Stress Relief</SelectItem>
                          <SelectItem value="Restorative Yoga for Chronic Pain Sufferers" className="pl-12">• Restorative Yoga for Chronic Pain Sufferers</SelectItem>
                          
                          <SelectItem value="Flexibility and Mobility" className="pl-8">• Flexibility and Mobility</SelectItem>
                          <SelectItem value="Mobility Training for Athletes" className="pl-10">• Mobility Training for Athletes</SelectItem>
                          <SelectItem value="Flexibility Training for Office Workers" className="pl-10">• Flexibility Training for Office Workers</SelectItem>
                          <SelectItem value="Flexibility Programs for Remote Workers" className="pl-12">• Flexibility Programs for Remote Workers</SelectItem>
                          
                          <SelectItem value="Nutrition" className="pl-6">• Nutrition</SelectItem>
                          <SelectItem value="Diet Plans" className="pl-8">• Diet Plans</SelectItem>
                          <SelectItem value="Ketogenic Diet" className="pl-10">• Ketogenic Diet</SelectItem>
                          <SelectItem value="Keto for Diabetics" className="pl-12">• Keto for Diabetics</SelectItem>
                          <SelectItem value="Keto for Athletes" className="pl-12">• Keto for Athletes</SelectItem>
                          <SelectItem value="Plant-Based Diets" className="pl-10">• Plant-Based Diets</SelectItem>
                          <SelectItem value="Plant-Based Nutrition for Bodybuilders" className="pl-12">• Plant-Based Nutrition for Bodybuilders</SelectItem>
                          <SelectItem value="Plant-Based Diet for Families" className="pl-12">• Plant-Based Diet for Families</SelectItem>
                          
                          <SelectItem value="Supplements" className="pl-8">• Supplements</SelectItem>
                          <SelectItem value="Pre-Workout Supplements" className="pl-10">• Pre-Workout Supplements</SelectItem>
                          <SelectItem value="Supplements for Endurance Athletes" className="pl-12">• Supplements for Endurance Athletes</SelectItem>
                          <SelectItem value="Pre-Workout for Beginners" className="pl-12">• Pre-Workout for Beginners</SelectItem>
                          <SelectItem value="Health Supplements" className="pl-10">• Health Supplements</SelectItem>
                          <SelectItem value="Supplements for Men's Health" className="pl-12">• Supplements for Men's Health</SelectItem>
                          <SelectItem value="Supplements for Hormonal Balance in Women" className="pl-12">• Supplements for Hormonal Balance in Women</SelectItem>
                          
                          <SelectItem value="Mental Health" className="pl-6">• Mental Health</SelectItem>
                          <SelectItem value="Stress Management" className="pl-8">• Stress Management</SelectItem>
                          <SelectItem value="Mindfulness and Meditation" className="pl-10">• Mindfulness and Meditation</SelectItem>
                          <SelectItem value="Meditation for Corporate Professionals" className="pl-12">• Meditation for Corporate Professionals</SelectItem>
                          <SelectItem value="Meditation for Sleep Improvement" className="pl-12">• Meditation for Sleep Improvement</SelectItem>
                          <SelectItem value="Stress Relief Techniques" className="pl-10">• Stress Relief Techniques</SelectItem>
                          <SelectItem value="Stress Relief for Parents" className="pl-12">• Stress Relief for Parents</SelectItem>
                          <SelectItem value="Stress Management for College Students" className="pl-12">• Stress Management for College Students</SelectItem>
                          
                          <SelectItem value="Therapy and Counseling" className="pl-8">• Therapy and Counseling</SelectItem>
                          <SelectItem value="Online Therapy" className="pl-10">• Online Therapy</SelectItem>
                          <SelectItem value="Online Therapy for Veterans" className="pl-12">• Online Therapy for Veterans</SelectItem>
                          <SelectItem value="Online Therapy for Social Anxiety" className="pl-12">• Online Therapy for Social Anxiety</SelectItem>
                          <SelectItem value="Cognitive Behavioral Therapy (CBT)" className="pl-10">• Cognitive Behavioral Therapy (CBT)</SelectItem>
                          <SelectItem value="CBT for Adolescents" className="pl-12">• CBT for Adolescents</SelectItem>
                          <SelectItem value="CBT for Obsessive-Compulsive Disorder" className="pl-12">• CBT for Obsessive-Compulsive Disorder</SelectItem>
                          
                          <SelectItem value="Preventative Health" className="pl-6">• Preventative Health</SelectItem>
                          <SelectItem value="Immunity Boosting" className="pl-8">• Immunity Boosting</SelectItem>
                          <SelectItem value="Immunity Programs for Children" className="pl-10">• Immunity Programs for Children</SelectItem>
                          <SelectItem value="Immunity Boosting for Travelers" className="pl-10">• Immunity Boosting for Travelers</SelectItem>
                          <SelectItem value="Longevity and Anti-Aging" className="pl-8">• Longevity and Anti-Aging</SelectItem>
                          <SelectItem value="Anti-Aging for Women Over 50" className="pl-10">• Anti-Aging for Women Over 50</SelectItem>
                          <SelectItem value="Longevity Coaching for Executives" className="pl-10">• Longevity Coaching for Executives</SelectItem>
                          <SelectItem value="Sleep Health" className="pl-8">• Sleep Health</SelectItem>
                          <SelectItem value="Sleep Optimization for Athletes" className="pl-10">• Sleep Optimization for Athletes</SelectItem>
                          <SelectItem value="Sleep Coaching for Busy Entrepreneurs" className="pl-10">• Sleep Coaching for Busy Entrepreneurs</SelectItem>
                          
                          <SelectItem value="Alternative Medicine" className="pl-6">• Alternative Medicine</SelectItem>
                          <SelectItem value="Herbal Medicine" className="pl-8">• Herbal Medicine</SelectItem>
                          <SelectItem value="Herbal Remedies for Skin Conditions" className="pl-10">• Herbal Remedies for Skin Conditions</SelectItem>
                          <SelectItem value="Herbal Medicine for Digestive Health" className="pl-10">• Herbal Medicine for Digestive Health</SelectItem>
                          <SelectItem value="Acupuncture" className="pl-8">• Acupuncture</SelectItem>
                          <SelectItem value="Acupuncture for Chronic Pain Relief" className="pl-10">• Acupuncture for Chronic Pain Relief</SelectItem>
                          <SelectItem value="Acupuncture for Fertility Issues" className="pl-10">• Acupuncture for Fertility Issues</SelectItem>
                          <SelectItem value="Aromatherapy" className="pl-8">• Aromatherapy</SelectItem>
                          <SelectItem value="Aromatherapy for Anxiety Reduction" className="pl-10">• Aromatherapy for Anxiety Reduction</SelectItem>
                          <SelectItem value="Aromatherapy for Insomnia" className="pl-10">• Aromatherapy for Insomnia</SelectItem>
                          
                          <SelectItem value="Physical Therapy and Rehabilitation" className="pl-6">• Physical Therapy and Rehabilitation</SelectItem>
                          <SelectItem value="Injury Rehabilitation" className="pl-8">• Injury Rehabilitation</SelectItem>
                          <SelectItem value="Post-Surgery Rehabilitation for Athletes" className="pl-10">• Post-Surgery Rehabilitation for Athletes</SelectItem>
                          <SelectItem value="Rehabilitation for Workplace Injuries" className="pl-10">• Rehabilitation for Workplace Injuries</SelectItem>
                          <SelectItem value="Chronic Pain Management" className="pl-8">• Chronic Pain Management</SelectItem>
                          <SelectItem value="Pain Management for Arthritis Patients" className="pl-10">• Pain Management for Arthritis Patients</SelectItem>
                          <SelectItem value="Pain Relief for Long-Distance Runners" className="pl-10">• Pain Relief for Long-Distance Runners</SelectItem>
                          <SelectItem value="Mobility Recovery" className="pl-8">• Mobility Recovery</SelectItem>
                          <SelectItem value="Mobility Recovery for Seniors" className="pl-10">• Mobility Recovery for Seniors</SelectItem>
                          <SelectItem value="Mobility Training After Car Accidents" className="pl-10">• Mobility Training After Car Accidents</SelectItem>
                          
                          <SelectItem value="Specialized Health Services" className="pl-6">• Specialized Health Services</SelectItem>
                          <SelectItem value="Women's Health" className="pl-8">• Women's Health</SelectItem>
                          <SelectItem value="Fertility Counseling" className="pl-10">• Fertility Counseling</SelectItem>
                          <SelectItem value="Fertility Counseling for Older Women" className="pl-12">• Fertility Counseling for Older Women</SelectItem>
                          <SelectItem value="Fertility Counseling for Same-Sex Couples" className="pl-12">• Fertility Counseling for Same-Sex Couples</SelectItem>
                          <SelectItem value="Menopause Support" className="pl-10">• Menopause Support</SelectItem>
                          <SelectItem value="Menopause Coaching for Professional Women" className="pl-12">• Menopause Coaching for Professional Women</SelectItem>
                          
                          <SelectItem value="Men's Health" className="pl-8">• Men's Health</SelectItem>
                          <SelectItem value="Prostate Health" className="pl-10">• Prostate Health</SelectItem>
                          <SelectItem value="Prostate Care for Men Over 50" className="pl-12">• Prostate Care for Men Over 50</SelectItem>
                          <SelectItem value="Prostate Health Awareness for Young Men" className="pl-12">• Prostate Health Awareness for Young Men</SelectItem>
                          <SelectItem value="Testosterone Optimization" className="pl-10">• Testosterone Optimization</SelectItem>
                          <SelectItem value="Testosterone Therapy for Athletes" className="pl-12">• Testosterone Therapy for Athletes</SelectItem>
                          <SelectItem value="Natural Testosterone Boosting for Men in Their 40s" className="pl-12">• Natural Testosterone Boosting for Men in Their 40s</SelectItem>
                          
                          <SelectItem value="Pediatric Health" className="pl-8">• Pediatric Health</SelectItem>
                          <SelectItem value="Child Nutrition" className="pl-10">• Child Nutrition</SelectItem>
                          <SelectItem value="Nutrition for Kids with Allergies" className="pl-12">• Nutrition for Kids with Allergies</SelectItem>
                          <SelectItem value="Nutrition Coaching for Picky Eaters" className="pl-12">• Nutrition Coaching for Picky Eaters</SelectItem>
                          <SelectItem value="Childhood Obesity Prevention" className="pl-10">• Childhood Obesity Prevention</SelectItem>
                          <SelectItem value="Obesity Prevention Programs for Schools" className="pl-12">• Obesity Prevention Programs for Schools</SelectItem>
                          <SelectItem value="Coaching for Parents on Childhood Obesity" className="pl-12">• Coaching for Parents on Childhood Obesity</SelectItem>
                          
                          <SelectItem value="Senior Health" className="pl-6">• Senior Health</SelectItem>
                          <SelectItem value="Aging in Place" className="pl-8">• Aging in Place</SelectItem>
                          <SelectItem value="Home Modifications for Seniors" className="pl-10">• Home Modifications for Seniors</SelectItem>
                          <SelectItem value="Senior Support Services for Aging in Place" className="pl-10">• Senior Support Services for Aging in Place</SelectItem>
                          <SelectItem value="Assisted Living Alternatives" className="pl-8">• Assisted Living Alternatives</SelectItem>
                          <SelectItem value="Alternative Housing Solutions for Seniors" className="pl-10">• Alternative Housing Solutions for Seniors</SelectItem>
                          <SelectItem value="Co-Living for Active Seniors" className="pl-10">• Co-Living for Active Seniors</SelectItem>
                          <SelectItem value="Senior Fitness" className="pl-8">• Senior Fitness</SelectItem>
                          <SelectItem value="Fitness Programs for Seniors with Limited Mobility" className="pl-10">• Fitness Programs for Seniors with Limited Mobility</SelectItem>
                          <SelectItem value="Water Aerobics for Seniors" className="pl-10">• Water Aerobics for Seniors</SelectItem>

                          <SelectSeparator />
                          <SelectLabel>Wealth Market</SelectLabel>
                          <SelectItem value="Wealth">Wealth</SelectItem>
                          
                          <SelectItem value="Investing" className="pl-6">• Investing</SelectItem>
                          <SelectItem value="Real Estate Investing" className="pl-8">• Real Estate Investing</SelectItem>
                          <SelectItem value="Residential Real Estate" className="pl-10">• Residential Real Estate</SelectItem>
                          <SelectItem value="Real Estate for First-Time Homebuyers" className="pl-12">• Real Estate for First-Time Homebuyers</SelectItem>
                          <SelectItem value="Real Estate Investing for Single Parents" className="pl-12">• Real Estate Investing for Single Parents</SelectItem>
                          <SelectItem value="Commercial Real Estate" className="pl-10">• Commercial Real Estate</SelectItem>
                          <SelectItem value="Commercial Real Estate for Small Business Owners" className="pl-12">• Commercial Real Estate for Small Business Owners</SelectItem>
                          
                          <SelectItem value="Stock Market Investing" className="pl-8">• Stock Market Investing</SelectItem>
                          <SelectItem value="Dividend Investing" className="pl-10">• Dividend Investing</SelectItem>
                          <SelectItem value="Dividend Investing for Retirees" className="pl-12">• Dividend Investing for Retirees</SelectItem>
                          <SelectItem value="Growth Stock Investing" className="pl-10">• Growth Stock Investing</SelectItem>
                          <SelectItem value="Stock Investing for Young Professionals" className="pl-12">• Stock Investing for Young Professionals</SelectItem>
                          <SelectItem value="Stock Market Education for Beginners" className="pl-12">• Stock Market Education for Beginners</SelectItem>
                          
                          <SelectItem value="Cryptocurrency" className="pl-8">• Cryptocurrency</SelectItem>
                          <SelectItem value="Bitcoin Trading" className="pl-10">• Bitcoin Trading</SelectItem>
                          <SelectItem value="Bitcoin for Entrepreneurs" className="pl-12">• Bitcoin for Entrepreneurs</SelectItem>
                          <SelectItem value="Bitcoin for Freelancers" className="pl-12">• Bitcoin for Freelancers</SelectItem>
                          <SelectItem value="NFT Investments" className="pl-10">• NFT Investments</SelectItem>
                          <SelectItem value="NFT Collecting for Art Enthusiasts" className="pl-12">• NFT Collecting for Art Enthusiasts</SelectItem>
                          <SelectItem value="NFT Investing for Gamers" className="pl-12">• NFT Investing for Gamers</SelectItem>
                          
                          <SelectItem value="Personal Finance" className="pl-6">• Personal Finance</SelectItem>
                          <SelectItem value="Budgeting" className="pl-8">• Budgeting</SelectItem>
                          <SelectItem value="Budgeting for Families" className="pl-10">• Budgeting for Families</SelectItem>
                          <SelectItem value="Budgeting for College Students" className="pl-10">• Budgeting for College Students</SelectItem>
                          <SelectItem value="Debt Management" className="pl-8">• Debt Management</SelectItem>
                          <SelectItem value="Debt Relief for High-Income Professionals" className="pl-10">• Debt Relief for High-Income Professionals</SelectItem>
                          <SelectItem value="Debt Consolidation for Millennials" className="pl-10">• Debt Consolidation for Millennials</SelectItem>
                          <SelectItem value="Saving and Emergency Funds" className="pl-8">• Saving and Emergency Funds</SelectItem>
                          <SelectItem value="Saving Strategies for Freelancers" className="pl-10">• Saving Strategies for Freelancers</SelectItem>
                          <SelectItem value="Emergency Fund Building for Single Parents" className="pl-10">• Emergency Fund Building for Single Parents</SelectItem>
                          
                          <SelectItem value="Business Development" className="pl-6">• Business Development</SelectItem>
                          <SelectItem value="Online Businesses" className="pl-8">• Online Businesses</SelectItem>
                          <SelectItem value="E-commerce" className="pl-10">• E-commerce</SelectItem>
                          <SelectItem value="E-commerce for Craft Businesses" className="pl-12">• E-commerce for Craft Businesses</SelectItem>
                          <SelectItem value="E-commerce for Fitness Trainers" className="pl-12">• E-commerce for Fitness Trainers</SelectItem>
                          <SelectItem value="Dropshipping" className="pl-10">• Dropshipping</SelectItem>
                          <SelectItem value="Dropshipping for Fashion Accessories" className="pl-12">• Dropshipping for Fashion Accessories</SelectItem>
                          <SelectItem value="Dropshipping for Eco-Friendly Products" className="pl-12">• Dropshipping for Eco-Friendly Products</SelectItem>
                          <SelectItem value="Freelancing" className="pl-8">• Freelancing</SelectItem>
                          <SelectItem value="Freelancing for Writers" className="pl-10">• Freelancing for Writers</SelectItem>
                          <SelectItem value="Freelancing for Graphic Designers" className="pl-10">• Freelancing for Graphic Designers</SelectItem>
                          <SelectItem value="Consulting" className="pl-8">• Consulting</SelectItem>
                          <SelectItem value="Financial Consulting for Startups" className="pl-10">• Financial Consulting for Startups</SelectItem>
                          <SelectItem value="Leadership Consulting for Nonprofits" className="pl-10">• Leadership Consulting for Nonprofits</SelectItem>
                          
                          <SelectItem value="Entrepreneurship" className="pl-6">• Entrepreneurship</SelectItem>
                          <SelectItem value="Social Entrepreneurship" className="pl-8">• Social Entrepreneurship</SelectItem>
                          <SelectItem value="Social Enterprise for Sustainability" className="pl-10">• Social Enterprise for Sustainability</SelectItem>
                          <SelectItem value="Social Enterprise for Education Access" className="pl-10">• Social Enterprise for Education Access</SelectItem>
                          <SelectItem value="Tech Startups" className="pl-8">• Tech Startups</SelectItem>
                          <SelectItem value="Tech Startups for Healthcare Solutions" className="pl-10">• Tech Startups for Healthcare Solutions</SelectItem>
                          <SelectItem value="AI-Based Startups for E-commerce" className="pl-10">• AI-Based Startups for E-commerce</SelectItem>
                          <SelectItem value="Franchise Ownership" className="pl-8">• Franchise Ownership</SelectItem>
                          <SelectItem value="Franchises in the Fitness Industry" className="pl-10">• Franchises in the Fitness Industry</SelectItem>
                          <SelectItem value="Franchises for Pet Care Services" className="pl-10">• Franchises for Pet Care Services</SelectItem>
                          
                          <SelectItem value="Career Development" className="pl-6">• Career Development</SelectItem>
                          <SelectItem value="Career Coaching" className="pl-8">• Career Coaching</SelectItem>
                          <SelectItem value="Career Transition Coaching for Mid-Level Professionals" className="pl-10">• Career Transition Coaching for Mid-Level Professionals</SelectItem>
                          <SelectItem value="Career Coaching for Recent Graduates" className="pl-10">• Career Coaching for Recent Graduates</SelectItem>
                          <SelectItem value="Skill Development" className="pl-8">• Skill Development</SelectItem>
                          <SelectItem value="Public Speaking for Executives" className="pl-10">• Public Speaking for Executives</SelectItem>
                          <SelectItem value="Negotiation Skills for Women" className="pl-10">• Negotiation Skills for Women</SelectItem>
                          <SelectItem value="Leadership Development" className="pl-8">• Leadership Development</SelectItem>
                          <SelectItem value="Leadership Coaching for Women in STEM" className="pl-10">• Leadership Coaching for Women in STEM</SelectItem>
                          <SelectItem value="Leadership Development for Nonprofit Leaders" className="pl-10">• Leadership Development for Nonprofit Leaders</SelectItem>
                          
                          <SelectItem value="Passive Income" className="pl-6">• Passive Income</SelectItem>
                          <SelectItem value="Rental Properties" className="pl-8">• Rental Properties</SelectItem>
                          <SelectItem value="Vacation Rental Properties for Families" className="pl-10">• Vacation Rental Properties for Families</SelectItem>
                          <SelectItem value="Long-Term Rentals in College Towns" className="pl-10">• Long-Term Rentals in College Towns</SelectItem>
                          <SelectItem value="Digital Products" className="pl-8">• Digital Products</SelectItem>
                          <SelectItem value="Creating Online Courses for Educators" className="pl-10">• Creating Online Courses for Educators</SelectItem>
                          <SelectItem value="Selling E-books for Health Enthusiasts" className="pl-10">• Selling E-books for Health Enthusiasts</SelectItem>
                          <SelectItem value="Affiliate Marketing" className="pl-8">• Affiliate Marketing</SelectItem>
                          <SelectItem value="Affiliate Marketing for Beauty Bloggers" className="pl-10">• Affiliate Marketing for Beauty Bloggers</SelectItem>
                          <SelectItem value="Affiliate Marketing for Travel Writers" className="pl-10">• Affiliate Marketing for Travel Writers</SelectItem>
                          
                          <SelectItem value="Retirement Planning" className="pl-6">• Retirement Planning</SelectItem>
                          <SelectItem value="Early Retirement" className="pl-8">• Early Retirement</SelectItem>
                          <SelectItem value="Retirement Planning for Tech Workers" className="pl-10">• Retirement Planning for Tech Workers</SelectItem>
                          <SelectItem value="Early Retirement Strategies for Firefighters" className="pl-10">• Early Retirement Strategies for Firefighters</SelectItem>
                          <SelectItem value="Pension Planning" className="pl-8">• Pension Planning</SelectItem>
                          <SelectItem value="Pension Strategies for Government Employees" className="pl-10">• Pension Strategies for Government Employees</SelectItem>
                          <SelectItem value="Pension Management for Military Veterans" className="pl-10">• Pension Management for Military Veterans</SelectItem>
                          <SelectItem value="Financial Independence" className="pl-8">• Financial Independence</SelectItem>
                          <SelectItem value="Financial Independence for Freelancers" className="pl-10">• Financial Independence for Freelancers</SelectItem>
                          <SelectItem value="FIRE (Financial Independence Retire Early) Coaching for Digital Nomads" className="pl-10">• FIRE (Financial Independence Retire Early) Coaching for Digital Nomads</SelectItem>
                          
                          <SelectItem value="Tax Strategies" className="pl-6">• Tax Strategies</SelectItem>
                          <SelectItem value="Small Business Taxation" className="pl-8">• Small Business Taxation</SelectItem>
                          <SelectItem value="Tax Planning for Online Entrepreneurs" className="pl-10">• Tax Planning for Online Entrepreneurs</SelectItem>
                          <SelectItem value="Tax Strategies for Small Business Owners with Multiple Income Streams" className="pl-10">• Tax Strategies for Small Business Owners with Multiple Income Streams</SelectItem>
                          <SelectItem value="Personal Taxation" className="pl-8">• Personal Taxation</SelectItem>
                          <SelectItem value="Tax Strategies for High-Income Earners" className="pl-10">• Tax Strategies for High-Income Earners</SelectItem>
                          <SelectItem value="Tax Planning for Remote Workers" className="pl-10">• Tax Planning for Remote Workers</SelectItem>
                          <SelectItem value="Tax Relief" className="pl-8">• Tax Relief</SelectItem>
                          <SelectItem value="Tax Relief for Families with Special Needs Children" className="pl-10">• Tax Relief for Families with Special Needs Children</SelectItem>
                          <SelectItem value="Tax Planning for Newlyweds" className="pl-10">• Tax Planning for Newlyweds</SelectItem>
                          
                          <SelectItem value="Wealth Preservation" className="pl-6">• Wealth Preservation</SelectItem>
                          <SelectItem value="Estate Planning" className="pl-8">• Estate Planning</SelectItem>
                          <SelectItem value="Estate Planning for Families with Special Needs Children" className="pl-10">• Estate Planning for Families with Special Needs Children</SelectItem>
                          <SelectItem value="Estate Planning for High-Net-Worth Individuals" className="pl-10">• Estate Planning for High-Net-Worth Individuals</SelectItem>
                          <SelectItem value="Asset Protection" className="pl-8">• Asset Protection</SelectItem>
                          <SelectItem value="Asset Protection for Real Estate Investors" className="pl-10">• Asset Protection for Real Estate Investors</SelectItem>
                          <SelectItem value="Asset Protection for Small Business Owners" className="pl-10">• Asset Protection for Small Business Owners</SelectItem>
                          <SelectItem value="Insurance Planning" className="pl-8">• Insurance Planning</SelectItem>
                          <SelectItem value="Life Insurance Strategies for Young Parents" className="pl-10">• Life Insurance Strategies for Young Parents</SelectItem>
                          <SelectItem value="Insurance Solutions for Entrepreneurs" className="pl-10">• Insurance Solutions for Entrepreneurs</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      id="search-button"
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
                
                <Collapsible open={additionalKeywordsOpen} onOpenChange={setAdditionalKeywordsOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-start p-2 -mx-2 rounded hover:bg-muted/50">
                    <ChevronDown className="w-4 h-4" />
                    <span>Additional Keywords (optional)</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div>
                      <Input
                        id="additional-keywords"
                        value={additionalKeywords}
                        onChange={(e) => setAdditionalKeywords(e.target.value)}
                        placeholder="e.g., small business, beginners, affordable..."
                        className="w-full"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card id="platform-selector" className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg border-b border-border pb-2">
                  <Globe className="w-5 h-5 text-research-blue" />
                  Select Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-1">
                  {platforms.map((platform) => {
                    const platformElement = (
                      <label
                        key={platform.id}
                        className="flex items-center space-x-1.5 p-1 hover:bg-muted/50 cursor-pointer rounded text-sm"
                      >
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                          className="h-3 w-3"
                        />
                        <span className={`${platform.color} flex-shrink-0`}>{platform.icon}</span>
                        <span className="font-medium truncate">{platform.name}</span>
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
              </CardContent>
            </Card>

            {/* Search Phrase Builder */}
            <Card id="phrase-builder" className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg border-b border-border pb-2">
                    <MessageSquare className="w-5 h-5 text-research-blue" />
                    Pain Point Filter
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={selectedPreset} onValueChange={applyPreset}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose preset..." />
                      </SelectTrigger>
                      <SelectContent>
                        {phrasePresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{preset.name}</span>
                              <span className="text-xs text-muted-foreground">{preset.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPhrases.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllPhrases}>
                        Clear All ({selectedPhrases.length})
                      </Button>
                    )}
                  </div>
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
          </div>

          {/* Right Column - Search Settings & Advanced Options */}
          <div className="space-y-4">
            {/* Search Settings */}
            <Card id="search-settings" className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base border-b border-border pb-2">
                  <Search className="w-4 h-4 text-research-blue" />
                  Search Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
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
                    <p className="text-xs text-muted-foreground mt-1">If Google is blocked, choose another engine.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Platform Options */}
            {selectedPlatforms.length > 0 && (
              <Card id="advanced-options" className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base border-b border-border pb-2">
                    <Settings className="w-4 h-4 text-research-blue" />
                    Advanced Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Facebook Advanced Options */}
                  {selectedPlatforms.includes('facebook') && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">Facebook Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div>
                          <Label className="text-sm font-medium">Group ID (optional)</Label>
                          <Input
                            placeholder="Enter Facebook group ID"
                            value={advancedOptions.facebook.groupId}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              facebook: { ...prev.facebook, groupId: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fb-public"
                            checked={advancedOptions.facebook.publicPostsOnly}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              facebook: { ...prev.facebook, publicPostsOnly: !!checked }
                            }))}
                          />
                          <Label htmlFor="fb-public" className="text-sm">Public posts only</Label>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Community Focus</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['support', 'community help', 'beginners', 'newbies'].map(type => (
                              <label key={type} className="flex items-center space-x-2 text-sm">
                                <Checkbox
                                  checked={advancedOptions.facebook.communityType.includes(type)}
                                  onCheckedChange={(checked) => {
                                    setAdvancedOptions(prev => ({
                                      ...prev,
                                      facebook: {
                                        ...prev.facebook,
                                        communityType: checked 
                                          ? [...prev.facebook.communityType, type]
                                          : prev.facebook.communityType.filter(t => t !== type)
                                      }
                                    }));
                                  }}
                                />
                                <span>{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Reddit Advanced Options */}
                  {selectedPlatforms.includes('reddit') && (
                    <Collapsible className="reddit-advanced-options" open={redditAdvancedOpen} onOpenChange={setRedditAdvancedOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">Reddit Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="reddit-self"
                            checked={advancedOptions.reddit.selfPostsOnly}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              reddit: { ...prev.reddit, selfPostsOnly: !!checked }
                            }))}
                          />
                          <Label htmlFor="reddit-self" className="text-sm">Self posts only</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="reddit-score"
                            checked={advancedOptions.reddit.minScore}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              reddit: { ...prev.reddit, minScore: !!checked }
                            }))}
                          />
                          <Label htmlFor="reddit-score" className="text-sm">High engagement posts (score ≥ {advancedOptions.reddit.scoreThreshold})</Label>
                        </div>
                        
                        {advancedOptions.reddit.minScore && (
                          <div>
                            <Label className="text-sm font-medium">Score Threshold</Label>
                            <Input
                              type="number"
                              min="1"
                              value={advancedOptions.reddit.scoreThreshold}
                              onChange={(e) => setAdvancedOptions(prev => ({
                                ...prev,
                                reddit: { ...prev.reddit, scoreThreshold: parseInt(e.target.value) || 50 }
                              }))}
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium">Author Search (optional)</Label>
                          <Input
                            placeholder="Enter Reddit username"
                            value={advancedOptions.reddit.author}
                            onChange={(e) => setAdvancedOptions(prev => ({
                              ...prev,
                              reddit: { ...prev.reddit, author: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Twitter Advanced Options */}
                  {selectedPlatforms.includes('twitter') && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">Twitter Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-emotional"
                              checked={advancedOptions.twitter.emotionalContent}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, emotionalContent: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-emotional" className="text-sm">Emotional content (struggling, frustrated, wish I knew)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-community"
                              checked={advancedOptions.twitter.communityValidation}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, communityValidation: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-community" className="text-sm">Community validation (anyone else, am I the only one)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-opinions"
                              checked={advancedOptions.twitter.opinions}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, opinions: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-opinions" className="text-sm">Opinions & hot takes (unpopular opinion, hot take)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-rants"
                              checked={advancedOptions.twitter.rants}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, rants: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-rants" className="text-sm">Rants & venting (no links)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-experiences"
                              checked={advancedOptions.twitter.experiences}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, experiences: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-experiences" className="text-sm">Experience sharing (with native video)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-verified"
                              checked={advancedOptions.twitter.verifiedOnly}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, verifiedOnly: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-verified" className="text-sm">Verified accounts only</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="twitter-media"
                              checked={advancedOptions.twitter.hasMedia}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, hasMedia: !!checked }
                              }))}
                            />
                            <Label htmlFor="twitter-media" className="text-sm">Posts with media only</Label>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Instagram Advanced Options */}
                  {selectedPlatforms.includes('instagram') && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">Instagram Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ig-link-bio"
                            checked={advancedOptions.instagram.linkInBio}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              instagram: { ...prev.instagram, linkInBio: !!checked }
                            }))}
                          />
                          <Label htmlFor="ig-link-bio" className="text-sm">Link in bio posts with struggle keywords</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ig-swipe-up"
                            checked={advancedOptions.instagram.swipeUp}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              instagram: { ...prev.instagram, swipeUp: !!checked }
                            }))}
                          />
                          <Label htmlFor="ig-swipe-up" className="text-sm">Swipe up posts with authenticity keywords</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ig-reels"
                            checked={advancedOptions.instagram.reelsOnly}
                            onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                              ...prev,
                              instagram: { ...prev.instagram, reelsOnly: !!checked }
                            }))}
                          />
                          <Label htmlFor="ig-reels" className="text-sm">Reels only with relatable phrases</Label>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* LinkedIn Advanced Options */}
                  {selectedPlatforms.includes('linkedin') && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">LinkedIn Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="linkedin-posts"
                              checked={advancedOptions.linkedin.publicPosts}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                linkedin: { ...prev.linkedin, publicPosts: !!checked }
                              }))}
                            />
                            <Label htmlFor="linkedin-posts" className="text-sm">Public posts with struggle language</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="linkedin-pulse"
                              checked={advancedOptions.linkedin.pulseArticles}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                linkedin: { ...prev.linkedin, pulseArticles: !!checked }
                              }))}
                            />
                            <Label htmlFor="linkedin-pulse" className="text-sm">Pulse articles with opinions</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="linkedin-company"
                              checked={advancedOptions.linkedin.companyPosts}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                linkedin: { ...prev.linkedin, companyPosts: !!checked }
                              }))}
                            />
                            <Label htmlFor="linkedin-company" className="text-sm">Company page feedback & reviews</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="linkedin-industry"
                              checked={advancedOptions.linkedin.industrySpecific}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                linkedin: { ...prev.linkedin, industrySpecific: !!checked }
                              }))}
                            />
                            <Label htmlFor="linkedin-industry" className="text-sm">Industry-specific pain points</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="linkedin-role"
                              checked={advancedOptions.linkedin.roleBased}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                linkedin: { ...prev.linkedin, roleBased: !!checked }
                              }))}
                            />
                            <Label htmlFor="linkedin-role" className="text-sm">Role-based research</Label>
                          </div>
                          
                          {advancedOptions.linkedin.roleBased && (
                            <div className="ml-6">
                              <Label className="text-sm font-medium">Target Role</Label>
                              <Select 
                                value={advancedOptions.linkedin.targetRole} 
                                onValueChange={(value) => setAdvancedOptions(prev => ({
                                  ...prev,
                                  linkedin: { ...prev.linkedin, targetRole: value }
                                }))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CEO">CEO</SelectItem>
                                  <SelectItem value="founder">Founder</SelectItem>
                                  <SelectItem value="marketing manager">Marketing Manager</SelectItem>
                                  <SelectItem value="product manager">Product Manager</SelectItem>
                                  <SelectItem value="sales manager">Sales Manager</SelectItem>
                                  <SelectItem value="CTO">CTO</SelectItem>
                                  <SelectItem value="CMO">CMO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* YouTube Advanced Options */}
                  {selectedPlatforms.includes('youtube') && (
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-research-blue" />
                          <span className="font-medium">YouTube Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3 space-y-3 pl-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-comments"
                              checked={advancedOptions.youtube.commentsSearch}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, commentsSearch: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-comments" className="text-sm">Comments with experience language</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-video"
                              checked={advancedOptions.youtube.videoContent}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, videoContent: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-video" className="text-sm">Video titles/descriptions with problems</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-channel"
                              checked={advancedOptions.youtube.channelSpecific}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, channelSpecific: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-channel" className="text-sm">Channel-specific honest reviews</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-reactions"
                              checked={advancedOptions.youtube.videoReactions}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, videoReactions: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-reactions" className="text-sm">Strong video reactions (game changer, scam, etc.)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-tutorial"
                              checked={advancedOptions.youtube.tutorialFeedback}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, tutorialFeedback: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-tutorial" className="text-sm">Tutorial feedback (worked/didn't work)</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-reviews"
                              checked={advancedOptions.youtube.productReviews}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, productReviews: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-reviews" className="text-sm">Product reviews with time usage</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="youtube-longterm"
                              checked={advancedOptions.youtube.longTermReviews}
                              onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                ...prev,
                                youtube: { ...prev.youtube, longTermReviews: !!checked }
                              }))}
                            />
                            <Label htmlFor="youtube-longterm" className="text-sm">Long-term reviews (6 months, 1 year later)</Label>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <>
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black/60 z-40" onClick={skipTutorial} />
          
          {/* Tutorial spotlight and tooltip */}
          <div className="fixed inset-0 z-50 pointer-events-none">
            {(() => {
              const currentStep = tutorialSteps[tutorialStep];
              const targetElement = document.querySelector(currentStep.target);
              
              if (!targetElement) return null;
              
              const rect = targetElement.getBoundingClientRect();
              const isLeft = currentStep.position === 'left';
              const isRight = currentStep.position === 'right';
              const isTop = currentStep.position === 'top';
              const isBottom = currentStep.position === 'bottom';
              
              // Calculate tooltip position
              let tooltipStyle: React.CSSProperties = {};
              let arrowClass = '';
              
              if (isLeft) {
                tooltipStyle = {
                  right: window.innerWidth - rect.left + 20,
                  top: rect.top + rect.height / 2,
                  transform: 'translateY(-50%)'
                };
                arrowClass = 'border-l-0 border-r-8 border-r-background left-full top-1/2 -translate-y-1/2';
              } else if (isRight) {
                tooltipStyle = {
                  left: rect.right + 20,
                  top: rect.top + rect.height / 2,
                  transform: 'translateY(-50%)'
                };
                arrowClass = 'border-r-0 border-l-8 border-l-background right-full top-1/2 -translate-y-1/2';
              } else if (isTop) {
                tooltipStyle = {
                  left: rect.left + rect.width / 2,
                  bottom: window.innerHeight - rect.top + 20,
                  transform: 'translateX(-50%)'
                };
                arrowClass = 'border-t-0 border-b-8 border-b-background top-full left-1/2 -translate-x-1/2';
              } else {
                tooltipStyle = {
                  left: rect.left + rect.width / 2,
                  top: rect.bottom + 20,
                  transform: 'translateX(-50%)'
                };
                arrowClass = 'border-b-0 border-t-8 border-t-background bottom-full left-1/2 -translate-x-1/2';
              }
              
              return (
                <>
                  {/* Spotlight highlight */}
                  <div 
                    className="absolute border-2 border-primary rounded-lg animate-pulse"
                    style={{
                      left: rect.left - 4,
                      top: rect.top - 4,
                      width: rect.width + 8,
                      height: rect.height + 8,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)'
                    }}
                  />
                  
                  {/* Tutorial tooltip */}
                  <div 
                    className="absolute pointer-events-auto bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm animate-fade-in"
                    style={tooltipStyle}
                  >
                    {/* Arrow */}
                    <div className={`absolute w-0 h-0 border-transparent border-8 ${arrowClass}`} />
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground mb-1">
                          {currentStep.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentStep.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {tutorialSteps.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === tutorialStep ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={skipTutorial}
                            className="text-xs"
                          >
                            Skip
                          </Button>
                          {tutorialStep > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={prevStep}
                              className="text-xs"
                            >
                              Back
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={nextStep}
                            className="text-xs"
                          >
                            {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Social media research tool. Built for researchers, marketers, and founders.
            </p>
          </div>
        </div>
      </footer>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <PaywallDialog 
        open={paywallDialogOpen} 
        onOpenChange={setPaywallDialogOpen}
        feature={paywallFeature}
      />
      <SavedQueriesDialog
        open={savedQueriesDialogOpen}
        onOpenChange={setSavedQueriesDialogOpen}
        onLoadQuery={handleLoadQuery}
      />
    </div>
  );
};

export default Index;