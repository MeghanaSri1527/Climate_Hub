import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherData } from '@/types/weather';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Sunrise, 
  Sunset,
  Gauge
} from 'lucide-react';

interface WeatherCardProps {
  weatherData: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData }) => {
  const getWeatherIcon = (iconCode: string) => {
    const icons: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return icons[iconCode] || '🌤️';
  };

  const getWeatherAlert = () => {
    const temp = weatherData.main.temp;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    
    if (temp > 35) return { type: 'extreme-heat', message: '🔥 Extreme Heat Warning' };
    if (temp < -10) return { type: 'extreme-cold', message: '🥶 Extreme Cold Warning' };
    if (weatherMain.includes('thunder')) return { type: 'storm', message: '⛈️ Storm Alert' };
    if (weatherMain.includes('rain') && weatherData.wind.speed > 10) return { type: 'severe-weather', message: '🌪️ Severe Weather Alert' };
    
    return null;
  };

  const alert = getWeatherAlert();
  const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
          <p className="text-muted-foreground capitalize">{weatherData.weather[0].description}</p>
        </div>
        <div className="text-right">
          <div className="text-6xl mb-2">{getWeatherIcon(weatherData.weather[0].icon)}</div>
        </div>
      </div>

      {alert && (
        <div className="mb-6">
          <Badge variant="destructive" className="text-sm font-medium">
            {alert.message}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">
              {Math.round(weatherData.main.temp)}°C
            </div>
            <div className="text-sm text-muted-foreground">
              Feels like {Math.round(weatherData.main.feels_like)}°C
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="text-sm">H: {Math.round(weatherData.main.temp_max)}°</span>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-primary" />
              <span className="text-sm">L: {Math.round(weatherData.main.temp_min)}°</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-accent" />
            <div>
              <div className="text-sm font-medium">{weatherData.main.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-accent" />
            <div>
              <div className="text-sm font-medium">{weatherData.wind.speed} m/s</div>
              <div className="text-xs text-muted-foreground">Wind</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-accent" />
            <div>
              <div className="text-sm font-medium">{weatherData.main.pressure} hPa</div>
              <div className="text-xs text-muted-foreground">Pressure</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-accent" />
            <div>
              <div className="text-sm font-medium">{(weatherData.visibility / 1000).toFixed(1)} km</div>
              <div className="text-xs text-muted-foreground">Visibility</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Sunrise className="h-4 w-4 text-weather-sunny" />
          <span className="text-sm">Sunrise: {sunrise}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Sunset className="h-4 w-4 text-weather-sunny" />
          <span className="text-sm">Sunset: {sunset}</span>
        </div>
      </div>
    </Card>
  );
};

export default WeatherCard;