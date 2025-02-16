import { City, Country, State } from "country-state-city";

// Precompute all data and lookup maps
const allCities = City.getAllCities();
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

// Pre-enrich cities with state and country names
const enrichedCities = allCities.map((city) => ({
  ...city,
  stateName: stateMap[`${city.countryCode}-${city.stateCode}`] || "",
  countryName: countryMap[city.countryCode] || "",
}));

const fetchLocation = async (query) => {
  try {
    const queryParts = query
      .split(",")
      .map((part) => part.trim().toLowerCase());

    const filteredCities = enrichedCities.filter((city) => {
      const cityNameMatch = city.name.toLowerCase().includes(queryParts[0]);
      let stateMatch = true;
      let countryMatch = true;

      if (queryParts[1]) {
        const stateQuery = queryParts[1];
        stateMatch =
          (city.stateName &&
            city.stateName.toLowerCase().includes(stateQuery)) ||
          (city.stateCode && city.stateCode.toLowerCase() === stateQuery);
      }

      if (queryParts[2]) {
        const countryQuery = queryParts[2];
        countryMatch =
          (city.countryName &&
            city.countryName.toLowerCase().includes(countryQuery)) ||
          (city.countryCode && city.countryCode.toLowerCase() === countryQuery);
      }

      return cityNameMatch && stateMatch && countryMatch;
    });

    // Map the results to the desired format
    return filteredCities.map(formatLocation);
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations.");
  }
};

const fetchLocationByCoordinates = async (latitude, longitude) => {
  try {
    const city = allCities.find(
      (city) =>
        parseFloat(city.latitude) === parseFloat(latitude) &&
        parseFloat(city.longitude) === parseFloat(longitude),
    );

    if (!city) {
      throw new Error("Location not found");
    }

    // Return the location details
    return formatLocation(city);
  } catch (error) {
    console.error("Error fetching location by coordinates:", error);
    throw new Error("Failed to fetch location by coordinates.");
  }
};

export { fetchLocationByCoordinates, fetchLocation };

const formatLocation = (city) => ({
  latitude: parseFloat(city.latitude),
  longitude: parseFloat(city.longitude),
  name: `${city.name}, ${city.countryCode === "US" ? city.stateCode : ""}${city.countryCode !== "US" ? city.countryCode : ""}`,
  id: `${city.latitude},${city.longitude},${city.name},${city.stateCode},${city.countryCode}`,
  country: countryMap[city.countryCode] || "Unknown Country",
  countryCode: city.countryCode,
  state: stateMap[`${city.countryCode}-${city.stateCode}`] || null,
  stateCode: city.stateCode || null,
  zip: null,
});
