import { City, Country, State } from "country-state-city";
import zipcodes from "zipcodes";

// Build city/state data
const allCities = City.getAllCities().map((city) => ({
  ...city,
  nameLower: city.name.toLowerCase(),
  stateCodeLower: city.stateCode?.toLowerCase(),
  countryCodeLower: city.countryCode.toLowerCase(),
}));

const allStates = State.getAllStates().map((s) => ({
  ...s,
  key: `${s.countryCode}-${s.isoCode}`,
  nameLower: s.name.toLowerCase(),
}));

const allCountries = Country.getAllCountries().map((c) => ({
  ...c,
  nameLower: c.name.toLowerCase(),
}));

// Maps for quick lookups
const countryMap = Object.fromEntries(
  allCountries.map((c) => [c.isoCode, c.name]),
);
const stateMap = Object.fromEntries(allStates.map((s) => [s.key, s.name]));

// State abbreviation to full name mapping (CA -> California)
const stateCodeToNameMap = Object.fromEntries(
  allStates.map((s) => [s.isoCode.toLowerCase(), s.nameLower]),
);

// Enrich cities
const enrichedCities = allCities.map((c) => {
  const stateName = stateMap[`${c.countryCode}-${c.stateCode}`] || "";
  const countryName = countryMap[c.countryCode] || "";
  return {
    ...c,
    stateName: stateName.toLowerCase(),
    countryName: countryName.toLowerCase(),
  };
});

// Create city index by first letter for faster lookup
const cityIndex = {};
enrichedCities.forEach((city) => {
  const firstChar = city.nameLower[0];
  if (!cityIndex[firstChar]) cityIndex[firstChar] = [];
  cityIndex[firstChar].push(city);
});

// Create a map for city-state ZIP validation
const usCityMap = {};
for (const c of allCities) {
  if (c.countryCodeLower === "us") {
    const key = `${c.nameLower}-${c.stateCodeLower}`;
    usCityMap[key] = c;
  }
}

// Format city
function formatCityLocation(city) {
  return {
    latitude: parseFloat(city.latitude),
    longitude: parseFloat(city.longitude),
    name: `${city.name}, ${city.countryCode === "US" ? city.stateCode : city.countryCode}`,
    id: `${city.latitude},${city.longitude},${city.name},${city.stateCode},${city.countryCode}`,
    country: countryMap[city.countryCode] || "Unknown Country",
    countryCode: city.countryCode,
    state: stateMap[`${city.countryCode}-${city.stateCode}`] || null,
    stateCode: city.stateCode || null,
    zip: null,
  };
}

// Deduplicate results
function deduplicateResults(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    if (!item) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function fetchLocation(query, page = 1, limit = 50) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (!tokens.length) return [];

  const allDigits = tokens.every((t) => /^\d+$/.test(t));
  if (allDigits) {
    const firstToken = tokens[0];
    const allZips = Object.values(zipcodes.codes);
    const zipMatches = allZips.filter((z) => z.zip.startsWith(firstToken));

    const results = zipMatches
      .map((z) => {
        const key = `${z.city.toLowerCase()}-${z.state.toLowerCase()}`;
        const matchedCity = usCityMap[key];

        if (!matchedCity) return null;

        const location = formatCityLocation(matchedCity);
        location.zip = z.zip;
        return location;
      })
      .filter(Boolean);

    const deduped = deduplicateResults(results);
    return deduped.slice((page - 1) * limit, page * limit);
  }

  const firstLetter = tokens[0][0];
  const candidateCities = cityIndex[firstLetter] || [];

  const filtered = candidateCities.filter((city) => {
    return tokens.every((token) => {
      if (city.nameLower.includes(token)) return true;
      if (city.stateName.includes(token)) return true;
      if (city.stateCodeLower === token) return true;
      if (stateCodeToNameMap[city.stateCodeLower] === token) return true;
      if (city.countryName.includes(token)) return true;
      if (city.countryCodeLower === token) return true;
      return false;
    });
  });

  const mapped = filtered.map(formatCityLocation);
  const deduped = deduplicateResults(mapped);
  return deduped.slice((page - 1) * limit, page * limit);
}

export async function fetchLocationByCoordinates(latitude, longitude) {
  try {
    const city = allCities.find(
      (c) =>
        parseFloat(c.latitude) === parseFloat(latitude) &&
        parseFloat(c.longitude) === parseFloat(longitude),
    );
    if (!city) {
      throw new Error("Location not found");
    }
    return formatCityLocation(city);
  } catch (error) {
    console.error("Error fetching location by coordinates:", error);
    throw new Error("Failed to fetch location by coordinates.");
  }
}
