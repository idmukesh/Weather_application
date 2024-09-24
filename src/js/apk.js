let open = document.getElementById('open');
let close = document.getElementById('close');
let navMenu = document.querySelector('.nav-menu');
let menuItems = document.querySelectorAll('.nav-menu li');

// Function to adjust menu icons visibility based on screen size
function adjustMenuIcons() {
  if (window.innerWidth > 768) {
    open.style.display = "none";
    close.style.display = "none";
    navMenu.classList.remove('show');
  } else {
    open.style.display = "block";
    close.style.display = "none";
    if (navMenu.classList.contains('show')) {
      navMenu.classList.remove('show');
    }
  }
}

// Open menu
open.addEventListener("click", () => {
  navMenu.classList.add('show');
  open.style.display = "none";
  close.style.display = "block";
});

// Close menu
close.addEventListener("click", () => {
  navMenu.classList.remove('show');
  open.style.display = "block";
  close.style.display = "none";
});

// Close menu on menu item click
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      navMenu.classList.remove('show');
      open.style.display = "block";
      close.style.display = "none";
    }
  });
});

// Adjust menu icons visibility on page load and resize
window.addEventListener("load", adjustMenuIcons);
window.addEventListener("resize", adjustMenuIcons);



// Weather functions
const searchBox = document.getElementById("enter-city");
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temprature'); // Ensure this ID is correct
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const weatherType = document.getElementById('weatherType');
const weatherImg = document.getElementById('weatherImg');


searchBtn.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent form submission

  const city = searchBox.value.trim(); // Get and trim the city input

  // Validate input
  if (!city) {
    // Display a message or handle empty input case
    cityName.textContent = 'Please enter a city name.';
    return;
  }

  if (city.length > 50) { // Example validation for length
    // Handle input that is too long
    cityName.textContent = 'City name is too long. Please enter a shorter name.';
    return;
  }

  // Proceed with the weather check
  checkWeather(city);
});

// Function to check weather with validation
function checkWeather(city) {
  const api_key = '0adcc9a449ac450973027ab04c010e69'; // Replace with your actual API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('City not found or API request failed');
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.name) {
        throw new Error('City not found');
      }
      cityName.innerHTML = `${data.name} (${new Date().toLocaleDateString()})`;
      temperature.innerHTML = `Temp <i class="fa-solid fa-temperature-high text-red-300 text-sm"></i> : ${Math.round(data.main.temp - 273.15)} °C`;
      wind.innerHTML = `Wind <i class="fa-solid fa-wind text-blue-300 text-sm"></i> : ${data.wind.speed} m/s`;
      humidity.innerHTML = `Humidity : <i class="fa-solid fa-droplet text-blue-300 text-sm"></i> ${data.main.humidity} %`;
      weatherType.innerHTML = `Weather: ${data.weather[0].description}`;
      

      weatherImg.src = getWeatherIcon(data.weather[0].description);
      displayForecast(city);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      cityName.textContent = 'Error fetching weather data. Please try again.';
      temperature.textContent = '';
      wind.textContent = '';
      humidity.textContent = '';
      weatherType.textContent = '';
      weatherImg.src = 'src/img/error.jpg'; // Default error image
    });
}


// Current location functions
const currentLocationButton = document.getElementById('current-location');

function getCityNameFromCoordinates(lat, lon) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then(response => response.json())
    .then(data => data.address.city || data.address.town || data.address.village || 'Unknown')
    .catch(error => {
      console.error('Error fetching city name:', error);
      return 'Unknown';
    });
}

function getCurrentLocation(event) {
  event.preventDefault(); // Prevent default button behavior

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      getCityNameFromCoordinates(lat, lon)
        .then(city => {
          searchBox.value = city;
          checkWeather(city);
        })
        .catch(error => {
          console.error('Error during location-based weather check:', error);
        });
    }, error => {
      console.error('Error getting current location:', error);
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

currentLocationButton.addEventListener('click', getCurrentLocation);

// Forecast functions
function displayForecast(city) {
  const api_key = '0adcc9a449ac450973027ab04c010e69'; // Replace with your actual API key
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Assuming data.list contains the forecast data for every 3 hours
      const forecastDivs = document.querySelectorAll('.upcoming-day > div');
      const forecasts = data.list.filter(item => item.dt_txt.endsWith('12:00:00')); // Get forecasts for 12:00 PM

      forecasts.slice(0, 5).forEach((forecast, index) => {
        const dayDiv = forecastDivs[index];
        // Convert the Unix timestamp to a Date object
        const date = new Date(forecast.dt * 1000);

        // Get the hours from the Date object
        const hours = date.getHours();

        // If the time is 12 PM or later, add one day to the date
        if (hours >= 12) {
          date.setDate(date.getDate() + 1);
        }

        // Format the new date as day-month-year
        const dateString = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;




        dayDiv.querySelector('h1').textContent = `(${dateString})`;
        dayDiv.querySelector('img').src = getWeatherIcon(forecast.weather[0].description);
        dayDiv.querySelector('p:nth-child(3)').textContent = `Temp: ${Math.round(forecast.main.temp - 273.15)} °C`;
        dayDiv.querySelector('p:nth-child(4)').textContent = `Wind: ${forecast.wind.speed} m/s`;
        dayDiv.querySelector('p:nth-child(5)').textContent = `Humidity: ${forecast.main.humidity} %`;
        dayDiv.querySelector('p:nth-child(6)').textContent = `Weather: ${forecast.weather[0].description}`;
      });
    })
    .catch(error => {
      console.error('Error fetching forecast data:', error);
    });
}

function getWeatherIcon(description) {
  const weatherDescription = description.toLowerCase();
  if (weatherDescription.includes("mist")) return 'src/img/mist.png';
  if (weatherDescription.includes("rain")) return 'src/img/rain.png';
  if (weatherDescription.includes("thunderstorm")) return 'src/img/thunderstorm.png';
  if (weatherDescription.includes("snow")) return 'src/img/snow.png';
  if (weatherDescription.includes("wind")) return 'src/img/wind.png';
  if (weatherDescription.includes("drizzle")) return 'src/img/drizzle.png';
  if (weatherDescription.includes("clear")) return 'src/img/clear.png';
  if (weatherDescription.includes("scattered clouds")) return 'src/img/clouds.png';
  return 'src/img/logo.png'; // Default image
}





document.addEventListener('DOMContentLoaded', function () {
  const dropdownIcon = document.getElementById('dropdown-icon');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const enterCityInput = document.getElementById('enter-city');
  const searchBtn = document.getElementById('search-btn');

  // Function to toggle the visibility of the dropdown icon
  function updateDropdownIconVisibility() {
    const listItems = dropdownMenu.querySelectorAll('li');
    if (listItems.length > 0) {
      dropdownIcon.style.display = 'flex'; // Show icon if there are items
    } else {
      dropdownIcon.style.display = 'none'; // Hide icon if no items
    }
  }

  // Load items from local storage and populate the dropdown menu
  function loadItemsFromLocalStorage() {
    const savedItems = JSON.parse(localStorage.getItem('dropdownItems')) || [];
    savedItems.forEach(item => {
      addItemToDropdown(item);
    });
    updateDropdownIconVisibility(); // Update icon visibility based on items
  }

  // Save items to local storage
  function saveItemsToLocalStorage() {
    const items = Array.from(dropdownMenu.getElementsByTagName('li')).map(item => item.textContent.trim());
    localStorage.setItem('dropdownItems', JSON.stringify(items));
  }

  // Add a new item to the top of the dropdown menu
  function addItemToDropdown(itemText) {
    const newItem = document.createElement('li');
    newItem.textContent = itemText;
    newItem.className = 'px-4 py-2 flex items-center justify-between hover:bg-gray-200 hover:shadow-md cursor-pointer transition-all duration-300';

    // Create and add the 'x' mark to the item
    const xMark = document.createElement('i');
    xMark.className = 'fas fa-times text-gray-500 ml-2 hover:text-red-600';
    xMark.addEventListener('click', function (event) {
      event.stopPropagation(); // Prevent triggering click event on li
      newItem.remove();
      saveItemsToLocalStorage(); // Save updated list to local storage
      updateDropdownIconVisibility(); // Update icon visibility
    });

    newItem.appendChild(xMark);
    dropdownMenu.insertBefore(newItem, dropdownMenu.firstChild);
    updateDropdownIconVisibility(); // Update icon visibility after adding an item
  }

  // Toggle the dropdown menu visibility
  dropdownIcon.addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
  });

  // Handle click events on dropdown menu items
  dropdownMenu.addEventListener('click', function (event) {
    if (event.target.tagName === 'LI') {
      enterCityInput.value = event.target.textContent.trim();
      dropdownMenu.classList.add('hidden');
    }
  });

  // Handle adding new items to the dropdown menu
  searchBtn.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission

    const newCity = enterCityInput.value.trim();

    if (newCity) {
      // Check if the new city already exists in the dropdown
      const existingItems = Array.from(dropdownMenu.getElementsByTagName('li'));
      const itemExists = existingItems.some(item => item.textContent.trim().toLowerCase() === newCity.toLowerCase());

      if (!itemExists) {
        // Add the new item to the dropdown menu
        addItemToDropdown(newCity);

        // Save updated items to local storage
        saveItemsToLocalStorage();

        // Optionally clear the input field
        enterCityInput.value = '';

        // Optionally hide the dropdown menu after adding the new item
        dropdownMenu.classList.add('hidden');
      }
    }
  });

  // Optionally close the dropdown if clicked outside
  document.addEventListener('click', function (event) {
    if (!dropdownIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add('hidden');
    }
  });

  // Initial load of items from local storage
  loadItemsFromLocalStorage();
});

