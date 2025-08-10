import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { SearchedCity } from '@/types/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationSearch, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentCities, setRecentCities] = useState<SearchedCity[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('weather_recent_cities');
    if (saved) {
      setRecentCities(JSON.parse(saved));
    }
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      
      // Add to recent cities
      const newCity: SearchedCity = {
        name: searchTerm.trim(),
        country: '',
        lat: 0,
        lon: 0,
        searchTime: Date.now()
      };
      
      const updated = [newCity, ...recentCities.filter(city => 
        city.name.toLowerCase() !== newCity.name.toLowerCase()
      )].slice(0, 5);
      
      setRecentCities(updated);
      localStorage.setItem('weather_recent_cities', JSON.stringify(updated));
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearRecentCities = () => {
    setRecentCities([]);
    localStorage.removeItem('weather_recent_cities');
  };

  const removeCity = (cityName: string) => {
    const updated = recentCities.filter(city => city.name !== cityName);
    setRecentCities(updated);
    localStorage.setItem('weather_recent_cities', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-card shadow-card">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!searchTerm.trim() || loading}
            className="bg-gradient-weather"
          >
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={onLocationSearch}
            disabled={loading}
            className="px-3"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {recentCities.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recent Searches
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearRecentCities}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentCities.map((city) => (
              <Badge
                key={`${city.name}-${city.searchTime}`}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
                onClick={() => onSearch(city.name)}
              >
                {city.name}
                <X 
                  className="h-3 w-3 hover:bg-destructive/20 rounded-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCity(city.name);
                  }}
                />
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;