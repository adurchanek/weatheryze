import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { FavoriteLocation, FavoritesState } from "../../types/favorites";
import { SaveFavoriteParams } from "../../types/favorites";

const initialState: FavoritesState = {
  data: null,
  status: "idle",
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async () => {
    const response = await axiosInstance.get<FavoriteLocation[]>(
      "/v1/backend-service/weather/favorites",
    );
    return response.data;
  },
);

export const deleteFavorite = createAsyncThunk(
  "favorites/deleteFavorite",
  async (id: number) => {
    await axiosInstance.delete(`/v1/backend-service/weather/favorites/${id}`);
    return id;
  },
);

export const saveFavorite = createAsyncThunk<
  FavoriteLocation,
  SaveFavoriteParams,
  { rejectValue: string }
>(
  "favorites/saveFavorite",
  async ({ location }: SaveFavoriteParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/v1/backend-service/weather/favorites",
        {
          location,
        },
      );
      return response.data as FavoriteLocation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
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
        (state, action: PayloadAction<number>) => {
          if (state.data) {
            state.data = state.data.filter((fav) => fav.id !== action.payload);
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
