// weatherRoutes.ts
import { Router, type Request, type Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST /api/weather - Fetch weather data for a city and save to history
router.post('/weather/', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.body;
    // Validate city name is provided
    if (!cityName) {
      // Return early with a 400 Bad Request response
      return res.status(400).json({ message: 'City name is required' });
    }

    // Get weather data from OpenWeather API
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    // Save city to search history
    await HistoryService.addCity(cityName);
    // Send weather data to client with 200 OK status
    return res.status(200).json(weatherData);
  } catch (error) {
    // Handle any errors (e.g., API failure, city not found) with a 500 response
    return res.status(500).json({ 
      message: 'Error fetching weather data', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// GET /api/weather/history - Retrieve search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    // Get all saved cities from history
    const cities = await HistoryService.getCities();
    // Send cities with 200 OK status
    return res.status(200).json(cities);
  } catch (err) {
    // Handle errors with a 500 response
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
    // Remove city by ID from history
    await HistoryService.removeCity(id);
    // Send 204 No Content on success
    return res.status(204).send();
  } catch (err) {
    // Handle errors with a 500 response
    return res.status(500).json({ 
      message: 'Error deleting city', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
});

export default router;