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
      id: `${city.name}-${city.countryCode}-${city.stateCode}`,
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

export default fetchLocation;
