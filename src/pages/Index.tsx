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
import { UpgradeDialog } from '@/components/upgrade/UpgradeDialog';
import { useQueries } from '@/hooks/useQueries';
import { useUsageLimit } from '@/hooks/useUsageLimit';
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
    id: 'tiktok',
    name: 'TikTok',
    site: 'site:tiktok.com',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
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

// Helper function to format volume numbers with K/M abbreviations
const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

// Market topic data structures with volume information
const healthMarketTopics = [
  { value: "Health", name: "Health", volume: 5400000, level: 0 },
  
  { value: "Fitness", name: "Fitness", volume: 1200000, level: 1 },
  { value: "Strength Training", name: "Strength Training", volume: 820000, level: 2 },
  { value: "Home-Based Strength Training", name: "Home-Based Strength Training", volume: 45000, level: 3 },
  { value: "Strength Training for Postpartum Mothers", name: "Strength Training for Postpartum Mothers", volume: 12000, level: 4 },
  { value: "Strength Training for Seniors", name: "Strength Training for Seniors", volume: 38000, level: 4 },
  { value: "Bodyweight Strength Training", name: "Bodyweight Strength Training", volume: 67000, level: 3 },
  { value: "Bodyweight Training for Travelers", name: "Bodyweight Training for Travelers", volume: 8500, level: 4 },
  { value: "Bodyweight Training for Military Personnel", name: "Bodyweight Training for Military Personnel", volume: 6200, level: 4 },
  
  { value: "Cardio Fitness", name: "Cardio Fitness", volume: 390000, level: 2 },
  { value: "High-Intensity Interval Training (HIIT)", name: "High-Intensity Interval Training (HIIT)", volume: 245000, level: 3 },
  { value: "HIIT for Busy Professionals", name: "HIIT for Busy Professionals", volume: 15000, level: 4 },
  { value: "HIIT for Weight Loss in Women", name: "HIIT for Weight Loss in Women", volume: 22000, level: 4 },
  
  { value: "Yoga", name: "Yoga", volume: 890000, level: 2 },
  { value: "Power Yoga", name: "Power Yoga", volume: 78000, level: 3 },
  { value: "Power Yoga for Athletes", name: "Power Yoga for Athletes", volume: 9500, level: 4 },
  { value: "Restorative Yoga", name: "Restorative Yoga", volume: 134000, level: 3 },
  { value: "Restorative Yoga for Stress Relief", name: "Restorative Yoga for Stress Relief", volume: 18000, level: 4 },
  { value: "Restorative Yoga for Chronic Pain Sufferers", name: "Restorative Yoga for Chronic Pain Sufferers", volume: 7200, level: 4 },
  
  { value: "Flexibility and Mobility", name: "Flexibility and Mobility", volume: 167000, level: 2 },
  { value: "Mobility Training for Athletes", name: "Mobility Training for Athletes", volume: 28000, level: 3 },
  { value: "Flexibility Training for Office Workers", name: "Flexibility Training for Office Workers", volume: 19000, level: 3 },
  { value: "Flexibility Programs for Remote Workers", name: "Flexibility Programs for Remote Workers", volume: 8900, level: 4 },
  
  { value: "Nutrition", name: "Nutrition", volume: 2100000, level: 1 },
  { value: "Diet Plans", name: "Diet Plans", volume: 456000, level: 2 },
  { value: "Ketogenic Diet", name: "Ketogenic Diet", volume: 234000, level: 3 },
  { value: "Keto for Diabetics", name: "Keto for Diabetics", volume: 34000, level: 4 },
  { value: "Keto for Athletes", name: "Keto for Athletes", volume: 18000, level: 4 },
  { value: "Plant-Based Diets", name: "Plant-Based Diets", volume: 189000, level: 3 },
  { value: "Plant-Based Nutrition for Bodybuilders", name: "Plant-Based Nutrition for Bodybuilders", volume: 12000, level: 4 },
  { value: "Plant-Based Diet for Families", name: "Plant-Based Diet for Families", volume: 15000, level: 4 },
  
  { value: "Supplements", name: "Supplements", volume: 678000, level: 2 },
  { value: "Pre-Workout Supplements", name: "Pre-Workout Supplements", volume: 123000, level: 3 },
  { value: "Supplements for Endurance Athletes", name: "Supplements for Endurance Athletes", volume: 23000, level: 4 },
  { value: "Pre-Workout for Beginners", name: "Pre-Workout for Beginners", volume: 16000, level: 4 },
  { value: "Health Supplements", name: "Health Supplements", volume: 298000, level: 3 },
  { value: "Supplements for Men's Health", name: "Supplements for Men's Health", volume: 45000, level: 4 },
  { value: "Supplements for Hormonal Balance in Women", name: "Supplements for Hormonal Balance in Women", volume: 28000, level: 4 },
  
  { value: "Mental Health", name: "Mental Health", volume: 1890000, level: 1 },
  { value: "Stress Management", name: "Stress Management", volume: 234000, level: 2 },
  { value: "Mindfulness and Meditation", name: "Mindfulness and Meditation", volume: 567000, level: 3 },
  { value: "Meditation for Corporate Professionals", name: "Meditation for Corporate Professionals", volume: 19000, level: 4 },
  { value: "Meditation for Sleep Improvement", name: "Meditation for Sleep Improvement", volume: 34000, level: 4 },
  { value: "Stress Relief Techniques", name: "Stress Relief Techniques", volume: 89000, level: 3 },
  { value: "Stress Relief for Parents", name: "Stress Relief for Parents", volume: 24000, level: 4 },
  { value: "Stress Management for College Students", name: "Stress Management for College Students", volume: 18000, level: 4 },
  
  { value: "Therapy and Counseling", name: "Therapy and Counseling", volume: 456000, level: 2 },
  { value: "Online Therapy", name: "Online Therapy", volume: 123000, level: 3 },
  { value: "Online Therapy for Veterans", name: "Online Therapy for Veterans", volume: 15000, level: 4 },
  { value: "Online Therapy for Social Anxiety", name: "Online Therapy for Social Anxiety", volume: 28000, level: 4 },
  { value: "Cognitive Behavioral Therapy (CBT)", name: "Cognitive Behavioral Therapy (CBT)", volume: 189000, level: 3 },
  { value: "CBT for Adolescents", name: "CBT for Adolescents", volume: 22000, level: 4 },
  { value: "CBT for Obsessive-Compulsive Disorder", name: "CBT for Obsessive-Compulsive Disorder", volume: 16000, level: 4 }
];

const wealthMarketTopics = [
  { value: "Wealth", name: "Wealth", volume: 3200000, level: 0 },
  
  { value: "Investing", name: "Investing", volume: 1890000, level: 1 },
  { value: "Real Estate Investing", name: "Real Estate Investing", volume: 456000, level: 2 },
  { value: "Residential Real Estate", name: "Residential Real Estate", volume: 234000, level: 3 },
  { value: "Real Estate for First-Time Homebuyers", name: "Real Estate for First-Time Homebuyers", volume: 89000, level: 4 },
  { value: "Real Estate Investing for Single Parents", name: "Real Estate Investing for Single Parents", volume: 12000, level: 4 },
  { value: "Commercial Real Estate", name: "Commercial Real Estate", volume: 167000, level: 3 },
  { value: "Commercial Real Estate for Small Business Owners", name: "Commercial Real Estate for Small Business Owners", volume: 18000, level: 4 },
  
  { value: "Stock Market Investing", name: "Stock Market Investing", volume: 678000, level: 2 },
  { value: "Dividend Investing", name: "Dividend Investing", volume: 123000, level: 3 },
  { value: "Dividend Investing for Retirees", name: "Dividend Investing for Retirees", volume: 34000, level: 4 },
  { value: "Growth Stock Investing", name: "Growth Stock Investing", volume: 89000, level: 3 },
  { value: "Stock Investing for Young Professionals", name: "Stock Investing for Young Professionals", volume: 28000, level: 4 },
  { value: "Stock Market Education for Beginners", name: "Stock Market Education for Beginners", volume: 45000, level: 4 },
  
  { value: "Cryptocurrency", name: "Cryptocurrency", volume: 890000, level: 2 },
  { value: "Bitcoin Investing", name: "Bitcoin Investing", volume: 234000, level: 3 },
  { value: "Bitcoin for Beginners", name: "Bitcoin for Beginners", volume: 67000, level: 4 },
  { value: "Altcoin Trading", name: "Altcoin Trading", volume: 156000, level: 3 },
  { value: "DeFi (Decentralized Finance)", name: "DeFi (Decentralized Finance)", volume: 89000, level: 3 },
  { value: "DeFi for Beginners", name: "DeFi for Beginners", volume: 28000, level: 4 },
  
  { value: "Business and Entrepreneurship", name: "Business and Entrepreneurship", volume: 1234000, level: 1 },
  { value: "Starting a Business", name: "Starting a Business", volume: 345000, level: 2 },
  { value: "Online Business", name: "Online Business", volume: 234000, level: 3 },
  { value: "E-commerce", name: "E-commerce", volume: 567000, level: 3 },
  { value: "Dropshipping", name: "Dropshipping", volume: 189000, level: 4 },
  { value: "Amazon FBA", name: "Amazon FBA", volume: 123000, level: 4 },
  { value: "Print on Demand", name: "Print on Demand", volume: 78000, level: 4 },
  
  { value: "Freelancing", name: "Freelancing", volume: 234000, level: 2 },
  { value: "Freelance Writing", name: "Freelance Writing", volume: 89000, level: 3 },
  { value: "Content Writing for Startups", name: "Content Writing for Startups", volume: 15000, level: 4 },
  { value: "Freelance Graphic Design", name: "Freelance Graphic Design", volume: 67000, level: 3 },
  { value: "Logo Design Services", name: "Logo Design Services", volume: 34000, level: 4 },
  
  { value: "Passive Income", name: "Passive Income", volume: 456000, level: 1 },
  { value: "Rental Income", name: "Rental Income", volume: 123000, level: 2 },
  { value: "Airbnb Hosting", name: "Airbnb Hosting", volume: 89000, level: 3 },
  { value: "Airbnb for Suburban Hosts", name: "Airbnb for Suburban Hosts", volume: 18000, level: 4 },
  { value: "Digital Products", name: "Digital Products", volume: 167000, level: 2 },
  { value: "Online Courses", name: "Online Courses", volume: 234000, level: 3 },
  { value: "Course Creation for Experts", name: "Course Creation for Experts", volume: 28000, level: 4 },
  { value: "Affiliate Marketing", name: "Affiliate Marketing", volume: 189000, level: 3 },
  { value: "Affiliate Marketing for Beauty Bloggers", name: "Affiliate Marketing for Beauty Bloggers", volume: 12000, level: 4 },
  { value: "Affiliate Marketing for Travel Writers", name: "Affiliate Marketing for Travel Writers", volume: 9500, level: 4 }
];

const relationshipMarketTopics = [
  { value: "Relationships", name: "Relationships", volume: 2890000, level: 0 },
  
  { value: "Dating", name: "Dating", volume: 1234000, level: 1 },
  { value: "Online Dating", name: "Online Dating", volume: 456000, level: 2 },
  { value: "Dating Apps", name: "Dating Apps", volume: 234000, level: 3 },
  { value: "Dating App Optimization", name: "Dating App Optimization", volume: 45000, level: 4 },
  { value: "Dating Profile Tips", name: "Dating Profile Tips", volume: 78000, level: 4 },
  { value: "Long-Distance Dating", name: "Long-Distance Dating", volume: 123000, level: 3 },
  { value: "Dating After Divorce", name: "Dating After Divorce", volume: 89000, level: 3 },
  { value: "Dating for Single Parents", name: "Dating for Single Parents", volume: 67000, level: 4 },
  { value: "Dating Over 50", name: "Dating Over 50", volume: 156000, level: 3 },
  { value: "Senior Dating Advice", name: "Senior Dating Advice", volume: 34000, level: 4 },
  
  { value: "Marriage and Commitment", name: "Marriage and Commitment", volume: 678000, level: 1 },
  { value: "Wedding Planning", name: "Wedding Planning", volume: 345000, level: 2 },
  { value: "Budget Wedding Planning", name: "Budget Wedding Planning", volume: 89000, level: 3 },
  { value: "DIY Wedding Decorations", name: "DIY Wedding Decorations", volume: 56000, level: 4 },
  { value: "Destination Weddings", name: "Destination Weddings", volume: 123000, level: 3 },
  { value: "Beach Wedding Planning", name: "Beach Wedding Planning", volume: 28000, level: 4 },
  { value: "Marriage Counseling", name: "Marriage Counseling", volume: 189000, level: 2 },
  { value: "Couples Therapy", name: "Couples Therapy", volume: 167000, level: 3 },
  { value: "Online Marriage Counseling", name: "Online Marriage Counseling", volume: 45000, level: 4 },
  { value: "Premarital Counseling", name: "Premarital Counseling", volume: 67000, level: 3 },
  
  { value: "Family Dynamics", name: "Family Dynamics", volume: 456000, level: 1 },
  { value: "Parenting", name: "Parenting", volume: 890000, level: 2 },
  { value: "New Parent Support", name: "New Parent Support", volume: 234000, level: 3 },
  { value: "Sleep Training for Babies", name: "Sleep Training for Babies", volume: 123000, level: 4 },
  { value: "Breastfeeding Support", name: "Breastfeeding Support", volume: 89000, level: 4 },
  { value: "Single Parenting", name: "Single Parenting", volume: 167000, level: 3 },
  { value: "Co-Parenting After Divorce", name: "Co-Parenting After Divorce", volume: 78000, level: 4 },
  { value: "Parenting Teenagers", name: "Parenting Teenagers", volume: 156000, level: 3 },
  { value: "Teen Communication Strategies", name: "Teen Communication Strategies", volume: 34000, level: 4 },
  
  { value: "Relationship Skills", name: "Relationship Skills", volume: 345000, level: 1 },
  { value: "Communication", name: "Communication", volume: 234000, level: 2 },
  { value: "Conflict Resolution", name: "Conflict Resolution", volume: 123000, level: 3 },
  { value: "Active Listening Skills", name: "Active Listening Skills", volume: 56000, level: 4 },
  { value: "Trust Building", name: "Trust Building", volume: 89000, level: 3 },
  { value: "Rebuilding Trust After Infidelity", name: "Rebuilding Trust After Infidelity", volume: 28000, level: 4 },
  { value: "Emotional Intelligence", name: "Emotional Intelligence", volume: 167000, level: 2 },
  { value: "EQ in Relationships", name: "EQ in Relationships", volume: 45000, level: 3 },
  
  { value: "Social Connections", name: "Social Connections", volume: 289000, level: 1 },
  { value: "Friendship", name: "Friendship", volume: 189000, level: 2 },
  { value: "Making Friends as an Adult", name: "Making Friends as an Adult", volume: 89000, level: 3 },
  { value: "Friendship for Introverts", name: "Friendship for Introverts", volume: 34000, level: 4 },
  { value: "Maintaining Long-Distance Friendships", name: "Maintaining Long-Distance Friendships", volume: 23000, level: 4 },
  { value: "Social Anxiety", name: "Social Anxiety", volume: 234000, level: 2 },
  { value: "Overcoming Social Anxiety", name: "Overcoming Social Anxiety", volume: 123000, level: 3 },
  { value: "Social Skills for Professionals", name: "Social Skills for Professionals", volume: 67000, level: 4 },
  
  { value: "Personal Development in Relationships", name: "Personal Development in Relationships", volume: 178000, level: 1 },
  { value: "Self-Love and Self-Care", name: "Self-Love and Self-Care", volume: 345000, level: 2 },
  { value: "Boundary Setting", name: "Boundary Setting", volume: 156000, level: 3 },
  { value: "Healthy Boundaries with Family", name: "Healthy Boundaries with Family", volume: 45000, level: 4 },
  { value: "Setting Boundaries at Work", name: "Setting Boundaries at Work", volume: 67000, level: 4 },
  { value: "Codependency Recovery", name: "Codependency Recovery", volume: 89000, level: 3 },
  { value: "Healing from Toxic Relationships", name: "Healing from Toxic Relationships", volume: 123000, level: 3 },
  { value: "Recovery from Narcissistic Abuse", name: "Recovery from Narcissistic Abuse", volume: 78000, level: 4 }
];

// Helper function to get proper indentation class based on level
const getIndentClass = (level: number): string => {
  switch (level) {
    case 0: return 'pl-3 font-semibold text-primary'
    case 1: return 'pl-5 font-medium'
    case 2: return 'pl-7'
    case 3: return 'pl-9 text-sm'
    case 4: return 'pl-11 text-sm text-muted-foreground'
    default: return 'pl-3'
  }
}

// Helper function to format display name with proper indentation indicators
const formatDisplayName = (name: string, level: number): string => {
  if (level === 0) return name
  const indent = '  '.repeat(level - 1)
  const bullet = level === 1 ? '•' : level === 2 ? '◦' : level === 3 ? '▪' : '▫'
  return `${indent}${bullet} ${name}`
}

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
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [savedQueriesDialogOpen, setSavedQueriesDialogOpen] = useState(false);
  const [saveQueryTitle, setSaveQueryTitle] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  
  const { user, signOut, isPro, isPremium, isSupabaseConnected } = useAuth();
  const { saveQuery } = useQueries();
  const { 
    canSearch, 
    incrementSearchCount, 
    getRemainingSearches,
    isLimited 
  } = useUsageLimit();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      target: '.profitable-market-templates',
      title: 'Step 2: Explore Profitable Market Templates',
      content: 'Save time with our pre-built market topic templates! Each template includes hundreds of profitable niches and sub-niches with real search volume data (like "1.2M" or "450K"). Perfect for discovering high-demand topics in Health, Wealth, and Relationships markets.',
      position: 'bottom'
    },
    {
      target: '#additional-keywords',  
      title: 'Step 3: Search Within Comments & Content',
      content: 'Use this field to search within the actual text of posts and comments. This powerful feature helps you find specific discussions, pain points, and user feedback that contain your exact keywords.',
      position: 'bottom'
    },
    {
      target: '#platform-selector',
      title: 'Step 4: Choose Platforms',
      content: 'Select which social media platforms to search. Each platform has unique advanced options for better targeting. Let me show you Reddit\'s advanced features!',
      position: 'right',
      action: () => {
        setSelectedPlatforms((prev) => (prev.includes('reddit') ? prev : [...prev, 'reddit']));
        setRedditAdvancedOpen(true);
      }
    },
    {
      target: '#advanced-options',
      title: 'Step 5: Platform Advanced Features',
      content: 'Each platform offers powerful advanced options! Reddit lets you target self-posts, high-engagement content, specific users, and more. These help find the most relevant pain points.',
      position: 'left',
      action: () => {
        setRedditAdvancedOpen(true);
      }
    },
    {
      target: '#phrase-builder',
      title: 'Step 6: Select Pain Point Phrases',
      content: 'Choose from pre-built phrase categories that help identify customer pain points, or select a preset for quick setup.',
      position: 'right'
    },
    {
      target: '#search-settings',
      title: 'Step 7: Configure Search Settings',
      content: 'Choose your search engine, time filter, and access advanced options for each selected platform.',
      position: 'left'
    },
    {
      target: '#search-button',
      title: 'Step 8: Try It Now!',
      content: 'Ready to see this in action? Click "Load Weight Loss Example" below to populate the form with a complete weight loss research setup, then hit the search button to start finding real customer pain points!',
      position: 'top',
      buttons: [
        {
          text: 'Load Weight Loss Example',
          action: () => {
            setMainTopic('weight loss');
            setAdditionalKeywords('"struggling with diet motivation" "craving plateau" "emotional eating"');
            setSelectedPlatforms(['reddit', 'facebook', 'google-trends']);
            setSelectedPhrases([
              "I can't",
              "I struggle with",
              "I'm frustrated by",
              "I hate",
              "I need help with",
              "I don't know how to",
              "I'm tired of",
              "I wish I could",
              "I'm stuck",
              "I'm overwhelmed by",
              "I'm confused about",
              "I'm worried about",
              "I'm afraid of",
              "I keep failing at",
              "I give up on",
              "I'm discouraged by",
              "I'm stressed about",
              "I can't afford",
              "I don't have time for",
              "I'm too busy for"
            ]);
            // Apply complete research preset to highlight it
            setSelectedPreset('complete-research');
          }
        }
      ]
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
    tiktok: {
      // Content Discovery
      hashtagTrends: [] as string[],
      contentTypes: [] as string[],
      soundTrends: false,
      challengeId: false,
      
      // Creator Features  
      creatorCollabs: [] as string[],
      creatorTier: [] as string[],
      specificCreator: '',
      
      // Engagement & Analytics
      minEngagement: false,
      engagementThreshold: 10000,
      viralPatterns: [] as string[],
      
      // Advanced Targeting
      brandMentions: false,
      crossPlatformTrends: false,
      realTimeAlerts: false,
      strictRecency: false
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
    const title = 'Pain Point Discovery Tool | Find Customer Problems & Pain Points';
    document.title = title;

    const desc = 'Discover customer pain points across social media platforms. Build advanced queries to find problems, struggles, and opportunities on Reddit, YouTube, Twitter, Instagram, Facebook, and LinkedIn.';
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
    const kw = additionalKeywords.trim();
    let keywordsPart = '';
    if (kw) {
      const quoted = Array.from(kw.matchAll(/"([^"]+)"/g)).map(m => m[1]);
      if (quoted.length > 0) {
        const orPhrases = quoted.map(p => `"${p}"`).join(' OR ');
        keywordsPart = ` AND intext:(${orPhrases})`;
      } else {
        keywordsPart = ` AND intext:"${kw}"`;
      }
    }

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

    // Check usage limits for free users
    if (!canSearch()) {
      setUpgradeReason('continue searching')
      setUpgradeDialogOpen(true)
      return;
    }

    // Increment search count for free users
    if (isLimited) {
      incrementSearchCount()
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
      const kw2 = additionalKeywords.trim();
      let keywordsPart = '';
      if (kw2) {
        const quoted2 = Array.from(kw2.matchAll(/"([^"]+)"/g)).map(m => m[1]);
        if (quoted2.length > 0) {
          const orPhrases2 = quoted2.map(p => `"${p}"`).join(' OR ');
          keywordsPart = ` AND intext:(${orPhrases2})`;
        } else {
          keywordsPart = ` AND intext:"${kw2}"`;
        }
      }
      
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
      } else if (platformId === 'tiktok') {
        platformToken = 'site:tiktok.com';
        
        // Add TikTok advanced options using Google-compatible syntax
        const tiktokOptions = advancedOptions.tiktok;
        
        let tiktokTerms = [];
        
        // Hashtag trends
        if (tiktokOptions.hashtagTrends.length > 0) {
          const hashtagTerms = tiktokOptions.hashtagTrends.map(tag => `"#${tag}"`).join(' OR ');
          tiktokTerms.push(`(${hashtagTerms})`);
        }
        
        // Content types
        if (tiktokOptions.contentTypes.length > 0) {
          const contentTerms = tiktokOptions.contentTypes.map(type => `"${type}"`).join(' OR ');
          tiktokTerms.push(`(${contentTerms})`);
        }
        
        // Sound trends
        if (tiktokOptions.soundTrends) {
          tiktokTerms.push('("original sound" OR "trending sound" OR "viral sound" OR "sound by")');
        }
        
        // Challenge identification
        if (tiktokOptions.challengeId) {
          tiktokTerms.push('("challenge" OR "#challenge" OR "try this" OR "trend")');
        }
        
        // Creator collaborations
        if (tiktokOptions.creatorCollabs.length > 0) {
          const collabTerms = tiktokOptions.creatorCollabs.map(type => `"${type}"`).join(' OR ');
          tiktokTerms.push(`(${collabTerms})`);
        }
        
        // Creator tiers
        if (tiktokOptions.creatorTier.length > 0) {
          const tierTerms = tiktokOptions.creatorTier.map(tier => `"${tier}"`).join(' OR ');
          tiktokTerms.push(`(${tierTerms})`);
        }
        
        // Specific creator
        if (tiktokOptions.specificCreator) {
          tiktokTerms.push(`"@${tiktokOptions.specificCreator}"`);
        }
        
        // Viral patterns
        if (tiktokOptions.viralPatterns.length > 0) {
          const viralTerms = tiktokOptions.viralPatterns.map(pattern => `"${pattern}"`).join(' OR ');
          tiktokTerms.push(`(${viralTerms})`);
        }
        
        // Brand mentions
        if (tiktokOptions.brandMentions) {
          tiktokTerms.push('("brand" OR "sponsored" OR "ad" OR "#ad" OR "partnership")');
        }
        
        // Combine terms if any are selected
        if (tiktokTerms.length > 0) {
          platformToken += ' ' + tiktokTerms.join(' ');
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

      // Build platform-specific query based on search engine
      let platformQuery;
      if (searchEngine === 'google') {
        // Use Google's advanced search operators
        const phrasesToken = selectedPhrases.length > 0 ? `intext:("${selectedPhrases.join('" OR "')}")` : '';
        const groupedContent = [platformToken, phrasesToken].filter(Boolean).join(' ');
        platformQuery = groupedContent ? `${topicPart}${keywordsPart} (${groupedContent})` : `${topicPart}${keywordsPart}`;
      } else {
        // Simplified query for DuckDuckGo and Bing
        const phrasesToken = selectedPhrases.length > 0 ? `"${selectedPhrases.join('" "')}"` : '';
        const groupedContent = [platformToken, phrasesToken].filter(Boolean).join(' ');
        platformQuery = groupedContent ? `${topicPart}${keywordsPart} ${groupedContent}` : `${topicPart}${keywordsPart}`;
      }

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
        
        // Use Google Video search for TikTok with strict recency
        if (platformId === 'tiktok' && advancedOptions.tiktok.strictRecency) {
          baseUrl += `&tbm=vid&sbd=1&tbs=${timeParams[timeFilter]}`;
        } else {
          baseUrl += `&tbs=${timeParams[timeFilter]}`;
        }
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
      tiktok: {
        hashtagTrends: [],
        contentTypes: [],
        soundTrends: false,
        challengeId: false,
        creatorCollabs: [],
        creatorTier: [],
        specificCreator: '',
        minEngagement: false,
        engagementThreshold: 10000,
        viralPatterns: [],
        brandMentions: false,
        crossPlatformTrends: false,
        realTimeAlerts: false,
        strictRecency: false
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
                  <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mx-4">
                  Pain Point Discovery Tool
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
                  <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
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
                  <div className="flex gap-2 items-center">
                    <Input
                      id="main-topic"
                      value={mainTopic}
                      onChange={(e) => setMainTopic(e.target.value)}
                      placeholder="e.g., 3 evergreen core markets, where people always spend: Health, Wealth, Relationships!"
                      className="flex-1"
                    />
                    <Button
                      id="search-button"
                      variant="default"
                      onClick={handleSearch}
                      disabled={!mainTopic.trim() || selectedPlatforms.length === 0}
                      className="px-4 py-2"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Search
                    </Button>
                  </div>
                  
                  <Collapsible className="mt-2">
                    <CollapsibleTrigger className="w-full profitable-market-templates">
                      <div className="flex items-center justify-between p-2 bg-research-gray rounded-lg hover:bg-research-blue-light transition-colors">
                        <h3 className="font-semibold text-left text-sm">Profitable Market Main Topic Templates</h3>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="grid grid-cols-3 gap-2">
                    {/* Health Market Dropdown */}
                    <Select key={`health-${mainTopic}`} value={mainTopic || undefined} onValueChange={(value) => setMainTopic(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Health Market" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectGroup>
                          <SelectLabel>Health Market</SelectLabel>
                          {healthMarketTopics.map((topic) => (
                            <SelectItem 
                              key={topic.value} 
                              value={topic.value}
                              className={getIndentClass(topic.level)}
                            >
                              {formatDisplayName(topic.name, topic.level)} ({formatVolume(topic.volume)})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Wealth Market Dropdown */}
                    <Select key={`wealth-${mainTopic}`} value={mainTopic || undefined} onValueChange={(value) => setMainTopic(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Wealth Market" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectGroup>
                          <SelectLabel>Wealth Market</SelectLabel>
                          {wealthMarketTopics.map((topic) => (
                            <SelectItem 
                              key={topic.value} 
                              value={topic.value}
                              className={getIndentClass(topic.level)}
                            >
                              {formatDisplayName(topic.name, topic.level)} ({formatVolume(topic.volume)})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Relationships Market Dropdown */}
                    <Select key={`relationships-${mainTopic}`} value={mainTopic || undefined} onValueChange={(value) => setMainTopic(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Relationships Market" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[400px]">
                        <SelectGroup>
                          <SelectLabel>Relationships Market</SelectLabel>
                          {relationshipMarketTopics.map((topic) => (
                            <SelectItem 
                              key={topic.value} 
                              value={topic.value}
                              className={getIndentClass(topic.level)}
                            >
                              {formatDisplayName(topic.name, topic.level)} ({formatVolume(topic.volume)})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="additional-keywords" className="text-sm font-medium mb-2 block">
                    Search within comments & content
                  </Label>
                  <Input
                    id="additional-keywords"
                    value={additionalKeywords}
                    onChange={(e) => setAdditionalKeywords(e.target.value)}
                    placeholder="e.g., small business, beginners, affordable..."
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find discussions mentioning these terms within posts and comments.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card id="platform-selector" className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-research-blue" />
                    Select Platforms
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedPlatforms.length === platforms.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlatforms(platforms.map(p => p.id));
                        } else {
                          setSelectedPlatforms([]);
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm font-medium cursor-pointer">Select All</Label>
                  </div>
                </div>
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
                          <SelectItem key={preset.id} value={preset.id} textValue={preset.name}>
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

                   {/* TikTok Advanced Options */}
                   {selectedPlatforms.includes('tiktok') && (
                     <Collapsible>
                       <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg border border-border hover:bg-research-blue-light">
                         <div className="flex items-center gap-2">
                           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                             <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                           </svg>
                           <span className="font-medium">TikTok Options</span>
                         </div>
                         <ChevronDown className="w-4 h-4" />
                       </CollapsibleTrigger>
                       <CollapsibleContent className="mt-3 space-y-4 pl-4">
                         {/* Hashtag Trends */}
                         <div>
                           <Label className="text-sm font-medium mb-2 block">Hashtag Trends</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['fyp', 'viral', 'trending', 'foryou', 'foryoupage', 'trend', 'popular', 'explore'].map(tag => (
                               <label key={tag} className="flex items-center space-x-2 text-sm">
                                 <Checkbox
                                   checked={advancedOptions.tiktok.hashtagTrends.includes(tag)}
                                   onCheckedChange={(checked) => {
                                     setAdvancedOptions(prev => ({
                                       ...prev,
                                       tiktok: {
                                         ...prev.tiktok,
                                         hashtagTrends: checked 
                                           ? [...prev.tiktok.hashtagTrends, tag]
                                           : prev.tiktok.hashtagTrends.filter(t => t !== tag)
                                       }
                                     }));
                                   }}
                                 />
                                 <span>#{tag}</span>
                               </label>
                             ))}
                           </div>
                         </div>

                         {/* Content Types */}
                         <div>
                           <Label className="text-sm font-medium mb-2 block">Content Types</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['dance', 'comedy', 'educational', 'cooking', 'beauty', 'fitness', 'life hacks', 'review'].map(type => (
                               <label key={type} className="flex items-center space-x-2 text-sm">
                                 <Checkbox
                                   checked={advancedOptions.tiktok.contentTypes.includes(type)}
                                   onCheckedChange={(checked) => {
                                     setAdvancedOptions(prev => ({
                                       ...prev,
                                       tiktok: {
                                         ...prev.tiktok,
                                         contentTypes: checked 
                                           ? [...prev.tiktok.contentTypes, type]
                                           : prev.tiktok.contentTypes.filter(t => t !== type)
                                       }
                                     }));
                                   }}
                                 />
                                 <span>{type}</span>
                               </label>
                             ))}
                           </div>
                         </div>

                         {/* Creator Features */}
                         <div>
                           <Label className="text-sm font-medium mb-2 block">Creator Collaborations</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['duet', 'stitch', 'collaboration', 'collab'].map(collab => (
                               <label key={collab} className="flex items-center space-x-2 text-sm">
                                 <Checkbox
                                   checked={advancedOptions.tiktok.creatorCollabs.includes(collab)}
                                   onCheckedChange={(checked) => {
                                     setAdvancedOptions(prev => ({
                                       ...prev,
                                       tiktok: {
                                         ...prev.tiktok,
                                         creatorCollabs: checked 
                                           ? [...prev.tiktok.creatorCollabs, collab]
                                           : prev.tiktok.creatorCollabs.filter(c => c !== collab)
                                       }
                                     }));
                                   }}
                                 />
                                 <span>{collab}</span>
                               </label>
                             ))}
                           </div>
                         </div>

                         {/* Creator Tiers */}
                         <div>
                           <Label className="text-sm font-medium mb-2 block">Creator Tiers</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['micro influencer', 'macro influencer', 'celebrity', 'brand ambassador'].map(tier => (
                               <label key={tier} className="flex items-center space-x-2 text-sm">
                                 <Checkbox
                                   checked={advancedOptions.tiktok.creatorTier.includes(tier)}
                                   onCheckedChange={(checked) => {
                                     setAdvancedOptions(prev => ({
                                       ...prev,
                                       tiktok: {
                                         ...prev.tiktok,
                                         creatorTier: checked 
                                           ? [...prev.tiktok.creatorTier, tier]
                                           : prev.tiktok.creatorTier.filter(t => t !== tier)
                                       }
                                     }));
                                   }}
                                 />
                                 <span>{tier}</span>
                               </label>
                             ))}
                           </div>
                         </div>

                         {/* Specific Creator */}
                         <div>
                           <Label className="text-sm font-medium">Specific Creator (optional)</Label>
                           <Input
                             placeholder="Enter creator username (without @)"
                             value={advancedOptions.tiktok.specificCreator}
                             onChange={(e) => setAdvancedOptions(prev => ({
                               ...prev,
                               tiktok: { ...prev.tiktok, specificCreator: e.target.value }
                             }))}
                             className="mt-1"
                           />
                         </div>

                         {/* Viral Patterns */}
                         <div>
                           <Label className="text-sm font-medium mb-2 block">Viral Patterns</Label>
                           <div className="grid grid-cols-2 gap-2">
                             {['went viral', 'blew up', 'viral moment', 'trending now'].map(pattern => (
                               <label key={pattern} className="flex items-center space-x-2 text-sm">
                                 <Checkbox
                                   checked={advancedOptions.tiktok.viralPatterns.includes(pattern)}
                                   onCheckedChange={(checked) => {
                                     setAdvancedOptions(prev => ({
                                       ...prev,
                                       tiktok: {
                                         ...prev.tiktok,
                                         viralPatterns: checked 
                                           ? [...prev.tiktok.viralPatterns, pattern]
                                           : prev.tiktok.viralPatterns.filter(p => p !== pattern)
                                       }
                                     }));
                                   }}
                                 />
                                 <span>{pattern}</span>
                               </label>
                             ))}
                           </div>
                         </div>

                         {/* Additional Options */}
                         <div className="space-y-3">
                           <div className="flex items-center space-x-2">
                             <Checkbox
                               id="tiktok-sounds"
                               checked={advancedOptions.tiktok.soundTrends}
                               onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                 ...prev,
                                 tiktok: { ...prev.tiktok, soundTrends: !!checked }
                               }))}
                             />
                             <Label htmlFor="tiktok-sounds" className="text-sm">Sound & Music Trends</Label>
                           </div>
                           
                           <div className="flex items-center space-x-2">
                             <Checkbox
                               id="tiktok-challenges"
                               checked={advancedOptions.tiktok.challengeId}
                               onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                 ...prev,
                                 tiktok: { ...prev.tiktok, challengeId: !!checked }
                               }))}
                             />
                             <Label htmlFor="tiktok-challenges" className="text-sm">Challenge Identification</Label>
                           </div>
                           
                           <div className="flex items-center space-x-2">
                             <Checkbox
                               id="tiktok-brands"
                               checked={advancedOptions.tiktok.brandMentions}
                               onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                 ...prev,
                                 tiktok: { ...prev.tiktok, brandMentions: !!checked }
                               }))}
                             />
                             <Label htmlFor="tiktok-brands" className="text-sm">Brand Mentions & Sponsorships</Label>
                           </div>
                           
                           <div className="flex items-center space-x-2">
                             <Checkbox
                               id="tiktok-engagement"
                               checked={advancedOptions.tiktok.minEngagement}
                               onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                 ...prev,
                                 tiktok: { ...prev.tiktok, minEngagement: !!checked }
                               }))}
                             />
                             <Label htmlFor="tiktok-engagement" className="text-sm">High engagement content (≥ {advancedOptions.tiktok.engagementThreshold.toLocaleString()} interactions)</Label>
                           </div>
                           
                           <div className="flex items-center space-x-2">
                             <Checkbox
                               id="tiktok-recency"
                               checked={advancedOptions.tiktok.strictRecency}
                               onCheckedChange={(checked) => setAdvancedOptions(prev => ({
                                 ...prev,
                                 tiktok: { ...prev.tiktok, strictRecency: !!checked }
                               }))}
                             />
                             <Label htmlFor="tiktok-recency" className="text-sm">Strict recency (uses Video search for fresher results with time filters)</Label>
                           </div>
                           
                           {advancedOptions.tiktok.minEngagement && (
                             <div>
                               <Label className="text-sm font-medium">Engagement Threshold</Label>
                               <Input
                                 type="number"
                                 min="1000"
                                 step="1000"
                                 value={advancedOptions.tiktok.engagementThreshold}
                                 onChange={(e) => setAdvancedOptions(prev => ({
                                   ...prev,
                                   tiktok: { ...prev.tiktok, engagementThreshold: parseInt(e.target.value) || 10000 }
                                 }))}
                                 className="mt-1"
                               />
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
                        {Array.isArray((currentStep as any).buttons) && (currentStep as any).buttons.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(currentStep as any).buttons.map((btn: any, i: number) => (
                              <Button key={i} size="sm" variant="secondary" className="text-xs" onClick={btn.action}>
                                {btn.text}
                              </Button>
                            ))}
                          </div>
                        )}
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
      <UpgradeDialog 
        open={upgradeDialogOpen} 
        onOpenChange={setUpgradeDialogOpen}
        reason={upgradeReason}
      />
    </div>
  );
};

export default Index;