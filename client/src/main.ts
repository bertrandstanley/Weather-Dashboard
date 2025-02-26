import './styles/jass.css';

// Selecting required DOM elements and assigning them to variables for later use
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*
API Calls
*/
// Function to fetch current weather and forecast data from the backend
const fetchWeather = async (cityName: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await response.json();
    console.log('weatherData: ', weatherData);

    renderCurrentWeather(weatherData[0]); // Render current weather
    renderForecast(weatherData.slice(1)); // Render 5-day forecast
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
};

// Function to fetch search history from the backend
const fetchSearchHistory = async () => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return history.json();
};

// Function to delete a city from the search history
const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*
Render Functions
*/
// Function to render the current weather information on the page
const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = ''; // Clear previous content
    todayContainer.append(heading, tempEl, windEl, humidityEl); // Add new weather data
  }
};

// Function to render the 5-day weather forecast on the page
const renderForecast = (forecast: any): void => {
  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = ''; // Clear previous content
    forecastContainer.append(headingCol); // Add forecast section heading
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]); // Render each forecast card
  }
};

// Function to create and render a single forecast card
const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col); // Add forecast card to the page
  }
};

// Function to render the search history items
const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory;

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = ''; // Clear previous history items

    if (!historyList.length) {
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>'; // Show no history message
    }

    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem); // Add history items to the page
    }
  }
};

/*
Helper Functions
*/
// Function to create a forecast card element
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
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

// Function to create a button for a city in the search history
const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

// Function to create a delete button for removing a city from history
const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick); // Add click listener to delete
  return delBtnEl;
};

// Function to create a div for a history item
const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('row', 'history-item');
  return div;
};

// Function to build a history list item with city name and delete button
const buildHistoryListItem = (city: any) => {
  const historyDiv = createHistoryDiv();
  const historyBtn = createHistoryButton(city.city);
  const deleteBtn = createDeleteButton();
  historyDiv.append(historyBtn, deleteBtn); // Add buttons to the history item
  return historyDiv;
};

// Event handler for deleting a city from history
const handleDeleteHistoryClick = async (event: any) => {
  const cityId = event.target.closest('.history-item').dataset.id;
  await deleteCityFromHistory(cityId); // Remove city from history
  fetchSearchHistory().then(renderSearchHistory); // Refresh the search history
};

// Function to handle the search form submit event
const handleSearchFormSubmit = (event: SubmitEvent) => {
  event.preventDefault(); // Prevent the default form submission behavior
  const cityName = searchInput.value.trim(); // Get the city name from input field
  if (cityName) {
    fetchWeather(cityName); // Fetch weather data for the city
    fetchSearchHistory(); // Refresh search history
  }
};

/*
Event Listeners
*/
// Add event listener to the search form submit event
searchForm.addEventListener('submit', handleSearchFormSubmit);

/*
Initialize
*/
// Fetch and display the search history on page load
fetchSearchHistory();
