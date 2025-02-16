import { Location } from "./location";

export interface FavoriteLocation {
  id: number;
  user: string;
  name: string;
  locationId: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  state: string | null;
  stateCode: string | null;
  zip: string | null;
  createdAt: string;
}
export interface FavoritesState {
  data: FavoriteLocation[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

export interface SaveFavoriteParams {
  location: Location;
}
