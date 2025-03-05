// historyService.ts
class City {
  name: string;
  id: string;

  constructor(name: string, id: string = crypto.randomUUID()) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private storageKey = 'searchHistory';

  private read(): City[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private write(cities: City[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cities));
  }

  async getCities(): Promise<City[]> {
    return this.read();
  }

  async addCity(city: string): Promise<void> {
    const cities = this.read();
    if (!cities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
      cities.push(new City(city));
      this.write(cities);
    }
  }

  async removeCity(id: string): Promise<void> {
    const cities = this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    this.write(updatedCities);
  }
}

export default new HistoryService();