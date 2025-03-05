import axios from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

// Check if the API key is available in environment variables
if (!process.env.OPENWEATHER_API_KEY) {
  throw new Error('OPENWEATHER_API_KEY is not set in environment variables');
}

// Interface to represent the structure of location coordinates
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Interface to represent the structure of the API response for weather data
interface WeatherApiResponse {
  city: { name: string };
  list: {
    dt: number;
    main: { temp: number; humidity: number };
    wind: { speed: number };
    weather: { icon: string; description: string }[];
  }[];
}

// Weather class to structure weather data for frontend display
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;

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

// Service class to interact with OpenWeather API
class WeatherService {
  private baseURL: string; // Base URL for the API requests
  private apiKey: string; // API key for authentication

  constructor(apiKey: string = process.env.OPENWEATHER_API_KEY || '') {
    this.baseURL = 'https://api.openweathermap.org'; // Set the base URL for API
    this.apiKey = apiKey; // Use the provided or environment-based API key
  }

  // Private method to fetch location data based on the city name
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    try {
      const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
      const response = await axios.get(url); // Make the GET request
      if (!response.data[0]) return null; // If no data, return null
      return this.destructureLocationData(response.data[0]); // Return structured location data
    } catch (error) {
      console.error('Error fetching location data:', error); // Handle errors
      return null; // Return null if an error occurs
    }
  }

  // Private method to extract and return the relevant coordinates data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      name: locationData.name,
      lat: locationData.lat,
      lon: locationData.lon,
      country: locationData.country,
      state: locationData.state,
    };
  }

  // Private method to build the query string for fetching weather data based on coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Private method to fetch weather data based on the coordinates of the location
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherApiResponse | null> {
    try {
      const url = this.buildWeatherQuery(coordinates); // Build weather data URL
      const response = await axios.get<WeatherApiResponse>(url); // Fetch weather data
      return response.data; // Return the weather data response
    } catch (error) {
      console.error('Error fetching weather data:', error); // Handle errors
      return null; // Return null if an error occurs
    }
  }

  // Private method to parse and transform the current weather data into a Weather object
  private parseCurrentWeather(response: WeatherApiResponse): Weather {
    const current = response.list[0]; // Get the first weather entry (current weather)
    return new Weather(
      response.city.name, // City name
      dayjs.unix(current.dt).format('MM/DD/YYYY'), // Format the date
      current.main.temp, // Temperature in Fahrenheit
      current.wind.speed, // Wind speed
      current.main.humidity, // Humidity percentage
      current.weather[0].icon, // Weather icon code
      current.weather[0].description // Weather description
    );
  }

  private buildForecastArray(currentWeather: Weather, weatherData: WeatherApiResponse['list']): Weather[] {
    const forecastArray: Weather[] = [currentWeather]; // Start with the current weather

    // Log the weather data to debug
    console.log('Weather Data Received:', weatherData);

    // Target one data point per day, starting from tomorrow (using 8 intervals for midday)
    for (let i = 8; i < weatherData.length && forecastArray.length < 3; i += 8) { // Limit to 2 forecast days
      const forecast = weatherData[i];
      
      // Debug the timestamp
      console.log('Forecast Timestamp:', forecast.dt, 'Formatted Date:', dayjs.unix(forecast.dt).format('MM/DD/YYYY'));

      forecastArray.push(
        new Weather(
          currentWeather.city,
          dayjs.unix(forecast.dt).format('MM/DD/YYYY'), // Format the forecast date
          forecast.main.temp,
          forecast.wind.speed,
          forecast.main.humidity,
          forecast.weather[0].icon,
          forecast.weather[0].description
        )
      );
    }

    // Ensure we always return exactly 3 elements (current + 2 days)
    while (forecastArray.length < 3 && weatherData.length > 0) {
      const lastForecast = weatherData[weatherData.length - 1];
      const nextDate = dayjs.unix(lastForecast.dt).add(forecastArray.length - 1, 'day');
      console.log('Fallback Date:', nextDate.format('MM/DD/YYYY'));

      forecastArray.push(
        new Weather(
          currentWeather.city,
          nextDate.format('MM/DD/YYYY'),
          lastForecast.main.temp,
          lastForecast.wind.speed,
          lastForecast.main.humidity,
          lastForecast.weather[0].icon,
          lastForecast.weather[0].description
        )
      );
    }

    return forecastArray.slice(0, 3); // Return exactly 3 elements (current + 2 days)
  }

  // Main method to get the current weather and forecast for a given city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] } | null> {
    const locationData = await this.fetchLocationData(city); // Fetch location data for the city
    if (!locationData) {
      console.error('City not found'); // If no location data found, return null
      return null;
    }

    const weatherData = await this.fetchWeatherData(locationData); // Fetch weather data using the location coordinates
    if (!weatherData) return null; // If no weather data available, return null

    const currentWeather = this.parseCurrentWeather(weatherData); // Parse current weather data
    const forecast = this.buildForecastArray(currentWeather, weatherData.list); // Build the forecast array

    return {
      current: currentWeather, // Return current weather data
      forecast: forecast, // Return forecast data (current + 2 days)
    };
  }
}

// Export an instance of the WeatherService class
export default new WeatherService();