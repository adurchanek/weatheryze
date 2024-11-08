import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  LocationsSuggestionsData,
  LocationSearchParams,
  LocationState,
} from "../../types/location";

const initialState: LocationState = {
  locations: {
    data: null,
    status: "idle",
  },
  error: null,
};

// Async thunk to fetch forecast location suggestion data
export const fetchLocationsSuggestionsData = createAsyncThunk<
  LocationsSuggestionsData,
  LocationSearchParams,
  { rejectValue: string }
>(
  "location/fetchLocationsSuggestionsData",
  async ({ query, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<LocationsSuggestionsData>(
        `/location/suggest?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(
          limit,
        )}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Unknown error",
      );
    }
  },
);

const locationSlice = createSlice({
  name: "location",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationsSuggestionsData.pending, (state) => {
        state.locations.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchLocationsSuggestionsData.fulfilled,
        (state, action: PayloadAction<LocationsSuggestionsData>) => {
          state.locations.status = "succeeded";
          state.locations.data = action.payload;
        },
      )
      .addCase(fetchLocationsSuggestionsData.rejected, (state, action) => {
        state.locations.status = "failed";
        state.error = action.payload as string;
        state.locations.data = null;
      });
  },
});

export default locationSlice.reducer;
