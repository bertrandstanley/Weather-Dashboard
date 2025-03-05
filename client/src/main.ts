// Importing the stylesheet for styling the app
import './styles/jass.css';

// All necessary DOM elements selected
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

// HistoryService using localStorage
const HistoryService = {
  storageKey: 'searchHistory',
  
  getCities: (): { id: string; name: string }[] => {
    const data = localStorage.getItem(HistoryService.storageKey);
    return data ? JSON.parse(data) : [];
  },
  
  addCity: (cityName: string): void => {
    const cities = HistoryService.getCities();
    if (!cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
      cities.push({ id: crypto.randomUUID(), name: cityName });
      localStorage.setItem(HistoryService.storageKey, JSON.stringify(cities));
    }
  },
  
  removeCity: (id: string): void => {
    const cities = HistoryService.getCities();
    const updatedCities = cities.filter((city) => city.id !== id);
    localStorage.setItem(HistoryService.storageKey, JSON.stringify(updatedCities));
  },
};

// Fetch weather data for a given city (API call)
const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cityName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch weather data for ${cityName}`);
  }

  const weatherData = await response.json();
  console.log('weatherData:', weatherData);
  
  renderCurrentWeather(weatherData[0]); // Render current weather data
  renderForecast(weatherData.slice(1)); // Render 5-day forecast
};

// Render current weather data for a city
const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = '';
  todayContainer.append(heading, weatherIcon, tempEl, windEl, humidityEl);
};

// Render 5-day weather forecast
const renderForecast = (forecast: any): void => {
  forecastContainer.innerHTML = '';
  
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');
  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);
  forecastContainer.append(headingCol);

  for (const day of forecast) {
    renderForecastCard(day);
  }
};

// Render a single forecast card
const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};

// Create a new forecast card
const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

// Render the search history
const renderSearchHistory = (): void => {
  const cities = HistoryService.getCities();
  searchHistoryContainer.innerHTML = '';

  if (!cities.length) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    return;
  }

  // Show history from most recent to oldest
  for (const city of cities.reverse()) {
    const historyItem = buildHistoryListItem(city);
    searchHistoryContainer.append(historyItem);
  }
};

// Create a button for a city in the search history
const createHistoryButton = (cityName: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = cityName;
  btn.addEventListener('click', () => {
    searchInput.value = cityName;
    handleSearchFormSubmit(new Event('submit')); // Trigger search on click
  });
  return btn;
};

// Create a delete button for removing a city from history
const createDeleteButton = (city: { id: string; name: string }) => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add('fas', 'fa-trash-alt', 'delete-city', 'btn', 'btn-danger', 'col-2');
  delBtnEl.addEventListener('click', () => handleDeleteHistoryClick(city.id));
  return delBtnEl;
};

// Create the div that holds the history button and delete button
const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

// Build a list item for the history section
const buildHistoryListItem = (city: { id: string; name: string }) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

// Handle form submission for searching a city
const handleSearchFormSubmit = async (event: Event): Promise<void> => {
  event.preventDefault();

  const search = searchInput.value.trim();
  if (!search) {
    console.error('City cannot be blank');
    return;
  }

  try {
    await fetchWeather(search);
    HistoryService.addCity(search); // Save to localStorage
    renderSearchHistory(); // Re-render history
    searchInput.value = '';
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// Handle the delete button click in the search history
const handleDeleteHistoryClick = (id: string) => {
  HistoryService.removeCity(id); // Remove from localStorage
  renderSearchHistory(); // Re-render history
};

// Initial render of the search history (no default weather)
const init = async () => {
  renderSearchHistory(); // Only load and render the search history, no weather data
};

// Run initial render
init();

// Event listener for the search form submission
searchForm.addEventListener('submit', handleSearchFormSubmit);