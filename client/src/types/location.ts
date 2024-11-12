export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  id: string;
  country: string;
  zip: string;
}

// Types for argument structure
export interface LocationSearchParams {
  query: string;
  limit: number;
}

export interface LocationState {
  suggestions: {
    data: Location[] | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  error: string | null;
}
