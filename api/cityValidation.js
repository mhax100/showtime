const axios = require('axios');

/**
 * Validate city and get timezone using Google Places API
 * @param {string} cityInput - User input for city
 * @returns {Promise<{isValid: boolean, city?: string, timezone?: string, error?: string}>}
 */
const validateCityAndGetTimezone = async (cityInput) => {
  try {
    // Step 1: Find place using Places API Autocomplete
    const autocompleteResponse = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: cityInput,
        types: '(cities)',
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    if (!autocompleteResponse.data.predictions || autocompleteResponse.data.predictions.length === 0) {
      return { isValid: false, error: 'City not found' };
    }

    // Get the first (most relevant) prediction
    const prediction = autocompleteResponse.data.predictions[0];
    const placeId = prediction.place_id;

    // Step 2: Get place details including geometry and address components
    const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,address_components',
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    const placeDetails = detailsResponse.data.result;
    const { lat, lng } = placeDetails.geometry.location;

    // Format address as city, state (no country)
    const addressComponents = placeDetails.address_components;
    const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || placeDetails.name;
    const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name;
    
    const cityStateFormat = [city, state].filter(Boolean).join(', ');

    // Step 3: Get timezone using Timezone API
    const timezoneResponse = await axios.get('https://maps.googleapis.com/maps/api/timezone/json', {
      params: {
        location: `${lat},${lng}`,
        timestamp: Math.floor(Date.now() / 1000),
        key: process.env.GOOGLE_PLACES_API_KEY
      }
    });

    const timezone = timezoneResponse.data.timeZoneId;

    return {
      isValid: true,
      city: cityStateFormat,
      formattedAddress: placeDetails.formatted_address,
      timezone: timezone,
      coordinates: { lat, lng }
    };

  } catch (error) {
    console.error('Error validating city:', error);
    return { isValid: false, error: 'Failed to validate city' };
  }
};

module.exports = { validateCityAndGetTimezone };