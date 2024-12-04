import { Location } from "./location";

export interface FavoriteLocation {
  _id: string;
  id: string;
  user: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  state: string | null;
  stateCode: string | null;
  zip: string | null;
  date: string;
}

export interface FavoritesState {
  data: FavoriteLocation[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

export interface SaveFavoriteParams {
  location: Location;
}
