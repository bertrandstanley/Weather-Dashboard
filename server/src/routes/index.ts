import express from 'express';

// Initialize the Express router
const router = express.Router();

// Route to fetch weather data for a given city
router.post('/weather/', async (req, res) => {
  // Extract city name from the request body
  const { cityName } = req.body;

  // Check if city name is provided in the request body
  if (!cityName) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // Define API URL to fetch weather data using OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`;
    
    // Fetch weather data from the API
    const response = await fetch(url);
    const data: any = await response.json();

    // Handle any errors from the API response
    if (!response.ok) {
      throw new Error(data.message || 'Weather API error');
    }

    // Format the weather data into a structured response
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
      // Process the next 5 weather forecast data points
      ...data.list.slice(1, 6).map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        icon: item.weather[0].icon,
        iconDescription: item.weather[0].description,
        tempF: item.main.temp,
        windSpeed: item.wind.speed,
        humidity: item.main.humidity,
      })),
    ];

    // Return the formatted weather data to the client
    return res.json(weatherData); // Explicit return
  } catch (error: unknown) {
    // Catch any errors during the API request and log them
    console.error('Weather fetch error:', (error as Error).message);
    // Return a 500 status with an error message if the fetch fails
    return res.status(500).json({ error: 'Failed to fetch weather data' }); // Explicit return
  }
});

// Route to fetch the weather history (currently using placeholder data)
router.get('/weather/history', async (_req, res) => {
  // Placeholder history (replace with real data if needed)
  const history = [{ city: 'New York', id: '1' }];
  return res.json(history); // Return the weather history
});

// Export the router for use in other parts of the application
export default router;
