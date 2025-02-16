import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import {
  Location,
  LocationSearchParams,
  LocationState,
} from "../../types/location";
import { getLocationServiceUrl } from "../../../config";

const initialState: LocationState = {
  suggestions: {
    data: null,
    status: "idle",
  },
  selectedLocation: null,
  error: null,
};

// Fetch location suggestions based on user input
export const fetchLocationsSuggestionsData = createAsyncThunk<
  Location[],
  LocationSearchParams,
  { rejectValue: string }
>(
  "location/fetchLocationsSuggestionsData",
  async ({ query, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Location[]>(
        `/v1/${getLocationServiceUrl()}/location/suggest?query=${encodeURIComponent(query)}&limit=${encodeURIComponent(
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

// Fetch location details by latitude and longitude
export const fetchLocationByCoordinates = createAsyncThunk<
  Location,
  { latitude: number; longitude: number },
  { rejectValue: string }
>(
  "location/fetchLocationByCoordinates",
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Location>(
        `/v1/${getLocationServiceUrl()}/location/coordinates?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(
          longitude,
        )}`,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch location by coordinates.",
      );
    }
  },
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearSelectedLocation(state) {
      state.selectedLocation = null;
    },
    clearLocationData(state) {
      Object.assign(state, initialState);
    },
  },
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
      })
      .addCase(fetchLocationByCoordinates.pending, (state) => {
        state.selectedLocation = null;
        state.error = null;
      })
      .addCase(
        fetchLocationByCoordinates.fulfilled,
        (state, action: PayloadAction<Location>) => {
          state.selectedLocation = action.payload;
        },
      )
      .addCase(fetchLocationByCoordinates.rejected, (state, action) => {
        state.selectedLocation = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedLocation, clearLocationData } =
  locationSlice.actions;

export default locationSlice.reducer;
