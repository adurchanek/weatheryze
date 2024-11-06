import locationsReducer, {
  fetchLocationsSuggestionsData,
} from "../locationSlice";
import axiosInstance from "../../../services/axiosInstance";
import { configureStore, Store } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";
import {
  LocationsSuggestionsData,
  LocationState,
} from "../../../types/location";

// Mock axiosInstance
const mockAxios = new MockAdapter(axiosInstance);

describe("locationsSlice", () => {
  const initialState: LocationState = {
    locations: {
      data: null,
      status: "idle",
    },
    error: null,
  };

  let store: Store;

  beforeEach(() => {
    // Define store directly in the test
    store = configureStore({
      reducer: {
        locations: locationsReducer,
      },
      middleware: [thunk],
    });

    mockAxios.reset();
  });

  it("should return the initial state", () => {
    expect(locationsReducer(undefined, { type: String })).toEqual(initialState);
  });

  describe("fetchLocationsSuggestionsData", () => {
    it("should handle fetchLocationsSuggestionsData pending", () => {
      const action = { type: fetchLocationsSuggestionsData.pending.type };
      const state = locationsReducer(initialState, action);
      expect(state.locations.status).toBe("loading");
    });

    it("should handle fetchLocationsSuggestionsData fulfilled", async () => {
      const locations: LocationsSuggestionsData = {
        locations: [
          {
            latitude: -100,
            longitude: 100,
            name: "New York",
            id: "456",
            country: "United States",
            zip: "00000",
          },
          {
            latitude: -200,
            longitude: 200,
            name: "New Jersey",
            id: "456",
            country: "United States",
            zip: "11111",
          },
        ],
      };

      mockAxios
        .onGet("/location/suggest?searchInput=New&limit=3")
        .reply(200, locations);

      await store.dispatch(
        fetchLocationsSuggestionsData({
          searchLocation: "New",
          limit: 3,
        }) as any,
      );

      const state = store.getState().locations;
      expect(state.locations.status).toBe("succeeded");
      expect(state.locations.data).toEqual(locations);
    });

    it("should handle fetchLocationsSuggestionsData rejected", async () => {
      mockAxios.onGet("/location/suggest?searchInput=New&limit=3").reply(404, {
        message: "Location suggestion data not found",
      });

      await store.dispatch(
        fetchLocationsSuggestionsData({
          searchLocation: "New",
          limit: 2,
        }) as any,
      );

      const state = store.getState().locations;
      expect(state.locations.status).toBe("failed");
      expect(state.locations.data).toBeNull();
    });
  });
});
