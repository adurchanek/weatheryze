export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  id: string;
  country: string;
  countryCode: string;
  state: string | null;
  stateCode: string | null;
  zip: string | null;
}

export interface LocationSearchParams {
  query: string;
  limit: number;
}

export interface LocationState {
  suggestions: {
    data: Location[] | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  selectedLocation: Location | null;
  error: string | null;
}
