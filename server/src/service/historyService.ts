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
  // File path for storing the city search history
  private filePath = path.join(__dirname, '..', 'searchHistory.json');

  // Read cities from searchHistory.json
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, { encoding: 'utf8' });
      console.log('Data read from file:', data); // Log the file data for debugging purposes
      return JSON.parse(data) as City[]; // Parse and return the data as an array of City objects
    } catch (error) {
      console.error('Error reading file:', error); // Log errors if the file can't be read
      return []; // Return an empty array if there's an error
    }
  }

  // Write cities to searchHistory.json
  private async write(cities: City[]): Promise<void> {
    console.log('Writing to file:', cities); // Log the data being written for debugging purposes
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), { encoding: 'utf8' });
      console.log('Successfully wrote to file'); // Log success message if writing is successful
    } catch (error) {
      console.error('Error writing to file:', error); // Log errors if the write operation fails
    }
  }

  // Get all cities from history
  async getCities(): Promise<City[]> {
    return await this.read(); // Return the cities by reading the file
  }

  // Add a city to history if it doesn't already exist
  async addCity(city: string): Promise<void> {
    const cities = await this.read(); // Read the existing cities
    // Check for duplicates (case-insensitive)
    if (!cities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
      cities.push(new City(city)); // Add the new city if it doesn't exist
      await this.write(cities); // Save the updated city list to the file
    }
  }

  // Remove a city from history by ID
  async removeCity(id: string): Promise<void> {
    const cities = await this.read(); // Read the existing cities
    const updatedCities = cities.filter((city) => city.id !== id); // Remove the city with the specified ID
    await this.write(updatedCities); // Save the updated city list to the file
  }
}

// Export the HistoryService instance for use in other modules
export default new HistoryService();
