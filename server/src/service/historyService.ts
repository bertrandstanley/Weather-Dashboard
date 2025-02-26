// HistoryService.ts
import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Derive __dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// City class to structure city data with name and unique ID
class City {
  name: string;
  id: string;

  constructor(name: string, id: string = uuidv4()) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  // Path to searchHistory.json file, resolved relative to this file's location
  private filePath = path.join(__dirname, '..', 'searchHistory.json');

  // Read cities from searchHistory.json
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, { encoding: 'utf8' });
      return JSON.parse(data) as City[];
    } catch (error) {
      // Return empty array if file doesn't exist or there's an error
      return [];
    }
  }

  // Write cities to searchHistory.json
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), {
      encoding: 'utf8',
    });
  }

  // Get all cities from history
  async getCities(): Promise<City[]> {
    return await this.read();
  }

  // Add a city to history if it doesn't already exist
  async addCity(city: string): Promise<void> {
    const cities = await this.read();
    // Check for duplicates (case-insensitive)
    if (!cities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
      cities.push(new City(city));
      await this.write(cities);
    }
  }

  // Remove a city from history by ID
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();