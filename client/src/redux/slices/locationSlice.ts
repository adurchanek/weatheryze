import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  Location,
  LocationSearchParams,
  LocationState,
} from "../../types/location";

const initialState: LocationState = {
  suggestions: {
    data: null,
    status: "idle",
  },
  error: null,
};

// Async thunk to fetch forecast location suggestion data
export const fetchLocationsSuggestionsData = createAsyncThunk<
  Location[],
  LocationSearchParams,
  { rejectValue: string }
>(
  "location/fetchLocationsSuggestionsData",
  async ({ query, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Location[]>(
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
        state.suggestions.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchLocationsSuggestionsData.fulfilled,
        (state, action: PayloadAction<Location[]>) => {
          state.suggestions.status = "succeeded";
          state.suggestions.data = action.payload;
        },
      )
      .addCase(fetchLocationsSuggestionsData.rejected, (state, action) => {
        state.suggestions.status = "failed";
        state.error = action.payload as string;
        state.suggestions.data = null;
      });
  },
});

export default locationSlice.reducer;
