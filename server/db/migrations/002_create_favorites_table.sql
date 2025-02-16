CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    location_id VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    state VARCHAR(255),
    state_code VARCHAR(10),
    zip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, location_id)
);
