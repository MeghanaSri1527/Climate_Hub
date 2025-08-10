import axios from 'axios';
import { WeatherData, ForecastData } from '@/types/weather';

// OpenWeatherMap API key
const API_KEY = '4a1a91fdccbbb1fcd3df484324571e33';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Demo data for when API key is not available
const DEMO_WEATHER_DATA: WeatherData = {
  coord: { lon: -0.1276, lat: 51.5074 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  base: 'stations',
  main: {
    temp: 22.5,
    feels_like: 23.1,
    temp_min: 20.2,
    temp_max: 24.8,
    pressure: 1013,
    humidity: 65
  },
  visibility: 10000,
  wind: { speed: 3.2, deg: 210 },
  clouds: { all: 5 },
  dt: Date.now() / 1000,
  sys: {
    country: 'GB',
    sunrise: 1640059200,
    sunset: 1640092800
  },
  timezone: 0,
  id: 2643743,
  name: 'London',
  cod: 200
};

export class WeatherService {
  private static instance: WeatherService;
  private apiKey: string;

  private constructor() {
    this.apiKey = localStorage.getItem('openweather_api_key') || API_KEY;
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('openweather_api_key', key);
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public isValidApiKey(): boolean {
    return this.apiKey !== 'YOUR_OPENWEATHERMAP_API_KEY' && this.apiKey.length > 0;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!this.isValidApiKey()) {
      // Return demo data with city name replaced
      return { ...DEMO_WEATHER_DATA, name: city };
    }

    try {
      const response = await axios.get<WeatherData>(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    if (!this.isValidApiKey()) {
      return DEMO_WEATHER_DATA;
    }

    try {
      const response = await axios.get<WeatherData>(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(city: string): Promise<ForecastData> {
    if (!this.isValidApiKey()) {
      // Return demo forecast data
      const demoForecast: ForecastData = {
        cod: '200',
        message: 0,
        cnt: 40,
        list: Array.from({ length: 40 }, (_, i) => ({
          dt: Date.now() / 1000 + i * 3 * 60 * 60,
          main: {
            temp: 20 + Math.random() * 10,
            feels_like: 21 + Math.random() * 10,
            temp_min: 18 + Math.random() * 8,
            temp_max: 22 + Math.random() * 12,
            pressure: 1013 + Math.random() * 20,
            sea_level: 1013,
            grnd_level: 1010,
            humidity: 60 + Math.random() * 30,
            temp_kf: 0
          },
          weather: [{ 
            id: 800, 
            main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)], 
            description: 'demo weather', 
            icon: '01d' 
          }],
          clouds: { all: Math.floor(Math.random() * 100) },
          wind: { speed: Math.random() * 10, deg: Math.random() * 360 },
          visibility: 10000,
          pop: Math.random(),
          sys: { pod: i % 2 === 0 ? 'd' : 'n' },
          dt_txt: new Date(Date.now() + i * 3 * 60 * 60 * 1000).toISOString()
        })),
        city: {
          id: 2643743,
          name: city,
          coord: { lat: 51.5074, lon: -0.1276 },
          country: 'GB',
          population: 8000000,
          timezone: 0,
          sunrise: 1640059200,
          sunset: 1640092800
        }
      };
      return demoForecast;
    }

    try {
      const response = await axios.get<ForecastData>(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw new Error('Failed to fetch forecast data');
    }
  }
}