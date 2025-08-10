import React from 'react';
import { Card } from '@/components/ui/card';
import { ForecastData } from '@/types/weather';

interface ForecastCardProps {
  forecastData: ForecastData;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecastData }) => {
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

  // Group forecast data by day
  const dailyForecast = forecastData.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: date,
        temps: [],
        weather: [],
        items: []
      };
    }
    
    acc[dateKey].temps.push(item.main.temp);
    acc[dateKey].weather.push(item.weather[0]);
    acc[dateKey].items.push(item);
    
    return acc;
  }, {} as Record<string, { date: Date; temps: number[]; weather: any[]; items: any[] }>);

  const next5Days = Object.values(dailyForecast).slice(0, 5);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
      <div className="space-y-4">
        {next5Days.map((day, index) => {
          const minTemp = Math.min(...day.temps);
          const maxTemp = Math.max(...day.temps);
          const mainWeather = day.weather[0];
          const isToday = index === 0;
          
          return (
            <div 
              key={day.date.toDateString()} 
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">
                  {isToday ? 'Today' : day.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {mainWeather.description}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {getWeatherIcon(mainWeather.icon)}
                </div>
                
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(maxTemp)}° / {Math.round(minTemp)}°
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ForecastCard;