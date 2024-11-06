export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  id: string;
  country: string;
  zip: string;
}

export interface LocationsSuggestionsData {
  locations: Location[];
}

// Types for argument structure
export interface LocationSearchParams {
  searchLocation: string;
  limit: number;
}

export interface LocationState {
  locations: {
    data: LocationsSuggestionsData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  error: string | null;
}
