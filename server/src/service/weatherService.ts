// Import required modules for API requests, date handling, and environment variable management
import axios from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

// Ensure the OpenWeather API key is present in environment variables
console.log(process.env.OPENWEATHER_API_KEY);

if (!process.env.OPENWEATHER_API_KEY) {
  throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
}

// Define TypeScript interfaces for coordinates and weather API response structure
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface WeatherApiResponse {
  city: { name: string };
  list: {
    dt: number;
    main: { temp: number; humidity: number };
    wind: { speed: number };
    weather: { icon: string; description: string }[];
  }[];
}

// Weather class to structure weather data for frontend
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;

  // Constructor to initialize weather properties
  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// WeatherService class to handle API requests and manage weather data
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  // Constructor to initialize base URL and API key
  constructor(apiKey: string = process.env.OPENWEATHER_API_KEY || '') {
    this.baseURL = 'https://api.openweathermap.org';

    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
    }

    this.apiKey = apiKey;
  }

  // Private method to fetch location data based on a city name
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    try {
      const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
      const response = await axios.get(url);
      if (!response.data[0]) return null;
      return this.destructureLocationData(response.data[0]);
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  // Helper method to destructure location data into the Coordinates interface
  private destructureLocationData(locationData: any): Coordinates {
    return {
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon,
      country: locationData.country,
      state: locationData.state,
    };
  }

  // Method to build the weather API query URL based on coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Private method to fetch weather data for the given coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse | null> {
    try {
      const url = this.buildWeatherQuery(coordinates);
      const response = await axios.get<WeatherApiResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Method to parse the weather API response and create a Weather instance for current weather
  private parseCurrentWeather(response: WeatherApiResponse): Weather {
    const current = response.list[0];
    return new Weather(
      response.city.name,
      dayjs.unix(current.dt).format('MM/DD/YYYY'),
      current.main.temp,
      current.wind.speed,
      current.main.humidity,
      current.weather[0].icon,
      current.weather[0].description
    );
  }

// Builds a 5-day forecast array starting with the current day, adding one entry per subsequent day from the 3-hour interval weather data.
  private buildForecastArray(currentWeather: Weather, weatherData: WeatherApiResponse['list']): Weather[] {
    const forecastArray: Weather[] = [currentWeather];
    let currentDay = dayjs.unix(weatherData[0].dt).startOf('day'); // Start of the day (midnight)
    
    // Loop through the weather data to build the forecast for the next 5 days
    let forecastCount = 0;
    
    // Iterate over the weather data, starting from the second entry
    for (let i = 1; i < weatherData.length; i++) {
      const forecast = weatherData[i];
      const forecastDate = dayjs.unix(forecast.dt).startOf('day'); // Get the start of the day (midnight)
      
      // If the forecast date is a new day (not the same day as the previous one), add it to the forecast
      if (!forecastDate.isSame(currentDay, 'day')) {
        forecastArray.push(
          new Weather(
            currentWeather.city,
            forecastDate.format('MM/DD/YYYY'), // Format the date as MM/DD/YYYY
            forecast.main.temp,
            forecast.wind.speed,
            forecast.main.humidity,
            forecast.weather[0].icon,
            forecast.weather[0].description
          )
        );
        forecastCount++;
        
        // Update the currentDay to the next forecast date
        currentDay = forecastDate;
        
        // If we've already gathered 5 forecast entries, stop collecting
        if (forecastCount >= 5) {
          break;
        }
      }
    }
  
    return forecastArray;
  }

  // Public method to get the current weather and forecast for a specific city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] } | null> {
    const locationData = await this.fetchLocationData(city);
    if (!locationData) {
      console.error('City not found');
      return null;
    }
    
    const weatherData = await this.fetchWeatherData(locationData);
    if (!weatherData) return null;
    
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(currentWeather, weatherData.list);
    
    return {
      current: currentWeather,
      forecast: forecast,
    };
  }
}

// Export the instance of WeatherService to be used in other parts of the application
export default new WeatherService();
