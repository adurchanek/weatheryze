import { query } from "../db.js";

export const saveFavoriteLocation = async ({
  userId,
  name,
  latitude,
  longitude,
  locationId, // Location identifier
  country,
  countryCode,
  state = null,
  stateCode = null,
  zip = null,
}) => {
  const queryText = `
    INSERT INTO favorites (
      user_id, name, latitude, longitude, location_id, country, country_code, state, state_code, zip
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    userId,
    name,
    latitude,
    longitude,
    locationId,
    country,
    countryCode,
    state,
    stateCode,
    zip,
  ];
  const result = await query(queryText, values);

  // Transform the result to match the frontend interface
  return {
    id: result.rows[0].id,
    user: result.rows[0].user_id,
    name: result.rows[0].name,
    locationId: result.rows[0].location_id,
    latitude: result.rows[0].latitude,
    longitude: result.rows[0].longitude,
    country: result.rows[0].country,
    countryCode: result.rows[0].country_code,
    state: result.rows[0].state,
    stateCode: result.rows[0].state_code,
    zip: result.rows[0].zip,
    createdAt: result.rows[0].created_at,
  };
};

// Get all favorites for a user
export const getFavoriteLocations = async (userId) => {
  const queryText = `
    SELECT * FROM favorites WHERE user_id = $1;
  `;
  const result = await query(queryText, [userId]);

  return result.rows.map((fav) => ({
    id: fav.id,
    user: fav.user_id,
    name: fav.name,
    locationId: fav.location_id,
    latitude: fav.latitude,
    longitude: fav.longitude,
    country: fav.country,
    countryCode: fav.country_code,
    state: fav.state,
    stateCode: fav.state_code,
    zip: fav.zip,
    createdAt: fav.created_at,
  }));
};

// Delete a favorite location
export const deleteFavoriteLocation = async (favoriteId, userId) => {
  const queryText = `
    DELETE FROM favorites
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  const result = await query(queryText, [favoriteId, userId]);

  if (result.rows.length > 0) {
    return {
      id: result.rows[0].id,
      user: result.rows[0].user_id,
      name: result.rows[0].name,
      locationId: result.rows[0].location_id,
      latitude: result.rows[0].latitude,
      longitude: result.rows[0].longitude,
      country: result.rows[0].country,
      countryCode: result.rows[0].country_code,
      state: result.rows[0].state,
      stateCode: result.rows[0].state_code,
      zip: result.rows[0].zip,
      createdAt: result.rows[0].created_at,
    };
  }

  return null;
};
