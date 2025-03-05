import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST /api/weather - Fetch weather data for a city and save to history
router.post('/weather/', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Get weather data from OpenWeather API
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    if (!weatherData) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Log for debugging
    console.log('Forecast Data:', weatherData.forecast);

    // Transform to flat array: [current, day1, day2, day3, day4, day5]
    const responseData = [weatherData.current, ...weatherData.forecast.slice(1)]; // Current + 5 days

    // Save city to search history
    await HistoryService.addCity(cityName);

    // Send weather data as a flat array
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error fetching weather data', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// GET /api/weather/history - Retrieve search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    return res.status(200).json(cities);
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error fetching history', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
});

// DELETE /api/weather/history/:id - Remove a city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ 
      message: 'Error deleting city', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
});

export default router;