import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { FavoriteLocation, FavoritesState } from "../../types/favorites";

const initialState: FavoritesState = {
  data: null,
  status: "idle",
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async () => {
    const response =
      await axiosInstance.get<FavoriteLocation[]>("/weather/favorites");
    return response.data;
  },
);

export const deleteFavorite = createAsyncThunk(
  "favorites/deleteFavorite",
  async (id: string) => {
    await axiosInstance.delete(`/weather/favorites/${id}`);
    return id;
  },
);

export const saveFavorite = createAsyncThunk(
  "favorites/saveFavorite",
  async (location: string) => {
    const response = await axiosInstance.post("/weather/favorites", {
      location,
    });
    return response.data as FavoriteLocation;
  },
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchFavorites.fulfilled,
        (state, action: PayloadAction<FavoriteLocation[]>) => {
          state.status = "succeeded";
          state.data = action.payload;
        },
      )
      .addCase(fetchFavorites.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(
        deleteFavorite.fulfilled,
        (state, action: PayloadAction<string>) => {
          if (state.data) {
            state.data = state.data.filter((fav) => fav._id !== action.payload);
          }
        },
      )
      .addCase(
        saveFavorite.fulfilled,
        (state, action: PayloadAction<FavoriteLocation>) => {
          if (state.data) {
            state.data.push(action.payload);
          } else {
            state.data = [action.payload];
          }
        },
      );
  },
});

export default favoritesSlice.reducer;
