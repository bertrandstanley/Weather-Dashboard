// Import necessary libraries: express for routing and fetch for API calls
import express from 'express';

import fetch from 'node-fetch'; // Remove if using native fetch

// Initialize router for handling requests
const router = express.Router();

// POST route to fetch weather data for a given city
router.post('/weather/', async (req, res) => {
  const { cityName } = req.body;

  // Check if cityName is provided in the request body
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Construct the URL to fetch weather data from OpenWeather API
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;

    // Make the API request
    const response = await fetch(url);
    const data: any = await response.json();

    // Handle API error if response is not OK
    if (!response.ok) {
      throw new Error(data.message || 'Weather API error');
    }

    // Define and structure the weather data to be sent back in the response
    const weatherData = [
      {
        city: cityName,
        date: new Date().toLocaleDateString(),
        icon: data.list[0].weather[0].icon,
        iconDescription: data.list[0].weather[0].description,
        tempF: data.list[0].main.temp,
        windSpeed: data.list[0].wind.speed,
        humidity: data.list[0].main.humidity,
      },
      ...data.list.slice(1, 6).map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        icon: item.weather[0].icon,
        iconDescription: item.weather[0].description,
        tempF: item.main.temp,
        windSpeed: item.wind.speed,
        humidity: item.main.humidity,
      })),
    ];

    // Send the structured weather data in the response
    return res.json(weatherData); // Explicit return
  } catch (error: unknown) {
    // Catch and handle errors during the weather fetch process
    console.error('Weather fetch error:', (error as Error).message);
    return res.status(500).json({ error: 'Failed to fetch weather data' }); // Explicit return
  }
});

// GET route to fetch search history (placeholder data for now)
router.get('/weather/history', async (_req, res) => {
  // Placeholder history (replace with real data if needed)
  const history = [{ city: 'New York', id: '1' }];
  
  // Send the history data as a JSON response
  return res.json(history);
});

// Export the router to be used in the main server file
export default router;
