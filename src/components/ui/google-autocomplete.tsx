import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface Suggestion {
  title: string;
  snippet: string;
}

interface GoogleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const GoogleAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter your topic...",
  className = ""
}: GoogleAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-suggestions', {
        body: { query }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions?.length > 0);
      }
    } catch (error) {
      console.error('Error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Debounce the API call
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Extract the main topic from the title
    const cleanTitle = suggestion.title.replace(/[^\w\s]/g, '').trim();
    onChange(cleanTitle);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
        />
      </div>
      
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border shadow-lg bg-background">
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">
              Loading suggestions...
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="font-medium text-sm truncate">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {suggestion.snippet}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};