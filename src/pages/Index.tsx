import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false);

  // Auth and paywall state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [paywallDialogOpen, setPaywallDialogOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  const [savedQueriesDialogOpen, setSavedQueriesDialogOpen] = useState(false);
  const [saveQueryTitle, setSaveQueryTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  
  const { user, signOut, isPro, isPremium } = useAuth();
  const { saveQuery } = useQueries();
  const { toast } = useToast();

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
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
        setPlatformSelectorOpen(true);
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
        setPlatformSelectorOpen(false);
        setRedditAdvancedOpen(true);
      }
    },
    {
      target: '#additional-keywords',  
      title: 'Step 4: Add Keywords (Optional)',
      content: 'Add specific keywords to narrow down your search. This helps find more targeted pain points.',
      position: 'bottom'
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
        
        // Add Twitter advanced options
        const twitterOptions = advancedOptions.twitter;
        
        // Add sophisticated search patterns
        if (twitterOptions.emotionalContent) {
          platformToken += ' (struggling OR frustrated OR "wish I knew" OR "biggest mistake")';
        }
        if (twitterOptions.communityValidation) {
          platformToken += ' ("anyone else" OR "am I the only one") min_retweets:5';
        }
        if (twitterOptions.opinions) {
          platformToken += ' ("unpopular opinion" OR "hot take") min_faves:10';
        }
        if (twitterOptions.rants) {
          platformToken += ' (rant OR vent OR frustrated) -filter:links';
        }
        if (twitterOptions.experiences) {
          platformToken += ' ("my experience" OR "my journey") filter:native_video';
        }
        if (twitterOptions.verifiedOnly) {
          platformToken += ' filter:verified';
        }
        if (twitterOptions.hasMedia) {
          platformToken += ' filter:media';
        }
        
        // Add quality filters for engagement
        platformToken += ' lang:en -filter:retweets min_replies:3';
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
        
        // Add YouTube advanced options
        const youtubeOptions = advancedOptions.youtube;
        if (youtubeOptions.commentsSearch) {
          platformToken += ' intext:("I tried this" OR "this helped me" OR "I struggled with" OR "my experience")';
        }
        if (youtubeOptions.videoContent) {
          platformToken = 'site:youtube.com/watch ("review" OR "experience" OR "problems" OR "issues" OR "struggles")';
        }
        if (youtubeOptions.channelSpecific) {
          platformToken = 'site:youtube.com site:youtube.com/c/ ("honest review" OR "my thoughts" OR "problems with")';
        }
        if (youtubeOptions.videoReactions) {
          platformToken += ' ("this saved my life" OR "game changer" OR "waste of money" OR "don\'t buy this" OR "total scam")';
        }
        if (youtubeOptions.tutorialFeedback) {
          platformToken += ' ("this didn\'t work for me" OR "finally something that works" OR "I tried everything" OR "this is the only thing")';
        }
        if (youtubeOptions.productReviews) {
          platformToken += ' ("after 6 months of using" OR "honest opinion" OR "pros and cons" OR "before you buy")';
        }
        if (youtubeOptions.longTermReviews) {
          platformToken += ' ("long term review" OR "6 month update" OR "1 year later")';
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
    setPlatformSelectorOpen(false);
    
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
              <div className="flex items-center justify-center gap-3 mb-1">
                <img 
                  src={researchMascot} 
                  alt="Research Tool Mascot" 
                  className="w-10 h-10 rounded-lg shadow-sm"
                />
                <h1 className="text-2xl font-bold text-foreground">
                  Customer Pain Point Research Tool
                </h1>
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
                <Button variant="outline" size="sm" onClick={() => setAuthDialogOpen(true)}>
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
                  <CardTitle className="flex items-center gap-2 text-2xl">
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
                      placeholder="e.g., project management software, meal planning apps, fitness tracking..."
                      className="flex-1"
                    />
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
                <div>
                  <Label htmlFor="additionalKeywords" className="text-sm font-medium mb-2 block">
                    Additional Keywords <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="additional-keywords"
                    value={additionalKeywords}
                    onChange={(e) => setAdditionalKeywords(e.target.value)}
                    placeholder="e.g., small business, beginners, affordable..."
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card id="platform-selector" className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-research-blue" />
                    Select Platforms
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={platformSelectorOpen} onOpenChange={setPlatformSelectorOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-2 bg-research-gray rounded-lg hover:bg-research-blue-light transition-colors">
                      <h3 className="font-semibold text-left text-sm">
                        {selectedPlatforms.length > 0 && !platformSelectorOpen 
                          ? selectedPlatforms.map(id => platforms.find(p => p.id === id)?.name).join(', ')
                          : 'Available Platforms'
                        }
                      </h3>
                      {platformSelectorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="p-2 bg-white rounded-lg border border-border space-y-2">
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
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Search Phrase Builder */}
            <Card id="phrase-builder" className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-research-blue" />
                    Search Phrase Builder
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
                <CardTitle className="flex items-center gap-2 text-base">
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
                  <CardTitle className="flex items-center gap-2 text-base">
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
              © 2024 Customer Pain Point Research Tool. Built for researchers, marketers, and founders.
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