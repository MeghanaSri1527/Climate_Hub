import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForecastData } from '@/types/weather';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherChartProps {
  forecastData: ForecastData;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ forecastData }) => {
  // Process forecast data for the next 5 days
  const dailyData = forecastData.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        temps: [],
        humidity: [],
        windSpeed: [],
        label: date,
      };
    }
    acc[date].temps.push(item.main.temp);
    acc[date].humidity.push(item.main.humidity);
    acc[date].windSpeed.push(item.wind.speed);
    return acc;
  }, {} as Record<string, { temps: number[]; humidity: number[]; windSpeed: number[]; label: string }>);

  const chartData = Object.values(dailyData).slice(0, 5).map(day => ({
    label: day.label,
    temp: Math.round(day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length),
    humidity: Math.round(day.humidity.reduce((sum, h) => sum + h, 0) / day.humidity.length),
    windSpeed: Math.round(day.windSpeed.reduce((sum, w) => sum + w, 0) / day.windSpeed.length * 10) / 10,
  }));

  const temperatureChartData = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: chartData.map(d => d.temp),
        borderColor: 'hsl(210, 80%, 50%)',
        backgroundColor: 'hsl(210, 80%, 50%, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const humidityWindChartData = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        label: 'Humidity (%)',
        data: chartData.map(d => d.humidity),
        backgroundColor: 'hsl(195, 100%, 85%)',
        borderColor: 'hsl(195, 100%, 60%)',
        borderWidth: 2,
      },
      {
        label: 'Wind Speed (m/s)',
        data: chartData.map(d => d.windSpeed),
        backgroundColor: 'hsl(210, 20%, 70%)',
        borderColor: 'hsl(210, 20%, 50%)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'hsl(214.3, 31.8%, 91.4%)',
        },
      },
      x: {
        grid: {
          color: 'hsl(214.3, 31.8%, 91.4%)',
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Weather Trends</h3>
      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity-wind">Humidity & Wind</TabsTrigger>
        </TabsList>
        <TabsContent value="temperature" className="mt-4">
          <div className="h-64">
            <Line data={temperatureChartData} options={chartOptions} />
          </div>
        </TabsContent>
        <TabsContent value="humidity-wind" className="mt-4">
          <div className="h-64">
            <Bar data={humidityWindChartData} options={chartOptions} />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default WeatherChart;