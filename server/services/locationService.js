import { City, Country, State } from "country-state-city";

const fetchLocation = async (query) => {
  try {
    // Fetch all cities, states, and countries
    const allCities = City.getAllCities();
    const allStates = State.getAllStates();
    const allCountries = Country.getAllCountries();

    // Create lookup maps for countries and states
    const countryMap = allCountries.reduce((acc, country) => {
      acc[country.isoCode] = country.name;
      return acc;
    }, {});

    const stateMap = allStates.reduce((acc, state) => {
      acc[`${state.countryCode}-${state.isoCode}`] = state.name;
      return acc;
    }, {});

    // Filter cities based on the query
    const filteredCities = allCities.filter((city) =>
      city.name.toLowerCase().includes(query.toLowerCase()),
    );

    // Map the results to the desired format
    const locations = filteredCities.map((city) => ({
      latitude: parseFloat(city.latitude),
      longitude: parseFloat(city.longitude),
      name: city.name,
      id: `${city.latitude},${city.longitude},${city.name}`,
      country: countryMap[city.countryCode] || "Unknown Country",
      countryCode: city.countryCode,
      state: stateMap[`${city.countryCode}-${city.stateCode}`] || null,
      stateCode: city.stateCode || null,
      zip: null,
    }));

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations.");
  }
};

const fetchLocationByCoordinates = async (latitude, longitude) => {
  try {
    const allCities = City.getAllCities();

    // Find the city that matches the given latitude and longitude
    const city = allCities.find(
      (city) =>
        parseFloat(city.latitude) === parseFloat(latitude) &&
        parseFloat(city.longitude) === parseFloat(longitude),
    );

    if (!city) {
      throw new Error("Location not found");
    }

    // Fetch all countries and states for lookup
    const allStates = State.getAllStates();
    const allCountries = Country.getAllCountries();

    const countryMap = allCountries.reduce((acc, country) => {
      acc[country.isoCode] = country.name;
      return acc;
    }, {});

    const stateMap = allStates.reduce((acc, state) => {
      acc[`${state.countryCode}-${state.isoCode}`] = state.name;
      return acc;
    }, {});

    // Return the location details
    return {
      latitude: parseFloat(city.latitude),
      longitude: parseFloat(city.longitude),
      name: city.name,
      id: `${city.latitude},${city.longitude},${city.name}`,
      country: countryMap[city.countryCode] || "Unknown Country",
      countryCode: city.countryCode,
      state: stateMap[`${city.countryCode}-${city.stateCode}`] || null,
      stateCode: city.stateCode || null,
      zip: null,
    };
  } catch (error) {
    console.error("Error fetching location by coordinates:", error);
    throw new Error("Failed to fetch location by coordinates.");
  }
};

export { fetchLocationByCoordinates, fetchLocation };
