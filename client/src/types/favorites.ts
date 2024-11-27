export interface FavoriteLocation {
  _id: string;
  user: string;
  location: string;
  date: string;
}

export interface FavoritesState {
  data: FavoriteLocation[] | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}
