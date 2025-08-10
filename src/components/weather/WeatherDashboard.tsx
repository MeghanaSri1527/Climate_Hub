import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Key, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeatherService } from '@/services/weatherService';
import { WeatherData, ForecastData } from '@/types/weather';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import ForecastCard from './ForecastCard';
import WeatherChart from './WeatherChart';
import WeatherMap from './WeatherMap';
import ApiKeyModal from './ApiKeyModal';
import ThemeToggle from './ThemeToggle';

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();
  
  const weatherService = WeatherService.getInstance();

  useEffect(() => {
    // Load default city on component mount
    handleCitySearch('London');
    
    // Set up auto-refresh every 15 minutes
    const interval = setInterval(() => {
      if (weatherData) {
        handleCitySearch(weatherData.name);
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const handleCitySearch = async (city: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const [weather, forecast] = await Promise.all([
        weatherService.getCurrentWeather(city),
        weatherService.getForecast(city)
      ]);
      
      setWeatherData(weather);
      setForecastData(forecast);
      setLastUpdate(new Date());
      
      if (!weatherService.isValidApiKey()) {
        toast({
          title: "Using Demo Data",
          description: "Add your OpenWeatherMap API key for real weather data",
          variant: "default",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weather = await weatherService.getCurrentWeatherByCoords(latitude, longitude);
            const forecast = await weatherService.getForecast(weather.name);
            
            setWeatherData(weather);
            setForecastData(forecast);
            setLastUpdate(new Date());
            toast({
              title: "Location Found",
              description: `Weather data for ${weather.name}`,
            });
          } catch (err) {
            setError('Failed to fetch weather for your location');
            toast({
              title: "Error",
              description: "Failed to fetch weather for your location",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setLoading(false);
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please search for a city instead.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
    }
  };

  const handleApiKeySubmit = (apiKey: string) => {
    weatherService.setApiKey(apiKey);
    toast({
      title: "API Key Saved",
      description: "Your OpenWeatherMap API key has been saved. Refreshing data...",
    });
    
    if (weatherData) {
      handleCitySearch(weatherData.name);
    }
  };

  const handleRefresh = () => {
    if (weatherData) {
      handleCitySearch(weatherData.name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Weather Dashboard</h1>
            <p className="text-muted-foreground">Real-time weather data and forecasts</p>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdate && (
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKeyModal(true)}
              className={!weatherService.isValidApiKey() ? 'border-yellow-500 text-yellow-600' : ''}
            >
              <Key className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* API Key Warning */}
        {!weatherService.isValidApiKey() && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Currently using demo data. Add your OpenWeatherMap API key for real weather data.</span>
              <Button variant="outline" size="sm" onClick={() => setShowApiKeyModal(true)}>
                Add API Key
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Search Bar */}
        <SearchBar 
          onSearch={handleCitySearch}
          onLocationSearch={handleLocationSearch}
          loading={loading}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading weather data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Weather Content */}
        {weatherData && forecastData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Weather Card */}
            <div className="lg:col-span-2">
              <WeatherCard weatherData={weatherData} />
            </div>

            {/* Forecast Card */}
            <div>
              <ForecastCard forecastData={forecastData} />
            </div>

            {/* Charts */}
            <div className="lg:col-span-2">
              <WeatherChart forecastData={forecastData} />
            </div>

            {/* Map */}
            <div>
              <WeatherMap 
                lat={weatherData.coord.lat}
                lon={weatherData.coord.lon}
                cityName={weatherData.name}
              />
            </div>
          </div>
        )}

        {/* API Key Modal */}
        <ApiKeyModal
          open={showApiKeyModal}
          onOpenChange={setShowApiKeyModal}
          onApiKeySubmit={handleApiKeySubmit}
        />
      </div>
    </div>
  );
};

export default WeatherDashboard;