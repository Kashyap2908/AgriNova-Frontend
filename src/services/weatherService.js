import api from './api';

// For now, since we don't have the backend connected, we will mock the API response.
// In the future, this will hit: api.get('/weather/current/')
export const getCurrentWeather = async (locationData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate dynamic data based on if they gave us a location
      const locationName = locationData?.locationText || 'Bhopal, MP';
      
      resolve({
        temperature: Math.floor(Math.random() * (35 - 20) + 20), // Random temp between 20-35
        condition: ['Sunny', 'Partly Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 4)],
        location: locationName,
        humidity: Math.floor(Math.random() * (90 - 40) + 40),
        windSpeed: Math.floor(Math.random() * (25 - 5) + 5),
        rainChance: Math.floor(Math.random() * 100),
      });
    }, 1500); // 1.5s delay to show loading state
  });
};
