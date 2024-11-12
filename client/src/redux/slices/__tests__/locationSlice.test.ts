import locationsReducer, {
  fetchLocationsSuggestionsData,
} from "../locationSlice";
import axiosInstance from "../../../services/axiosInstance";
import { configureStore, Store } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";
import { Location, LocationState } from "../../../types/location";

// Mock axiosInstance
const mockAxios = new MockAdapter(axiosInstance);

describe("locationsSlice", () => {
  const initialState: LocationState = {
    suggestions: {
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
      expect(state.suggestions.status).toBe("loading");
    });

    it("should handle fetchLocationsSuggestionsData fulfilled", async () => {
      const locations: Location[] = [
        {
          latitude: 42.8142,
          longitude: -73.9396,
          name: "New York",
          id: "1",
          country: "United States",
          zip: "00000",
        },
        {
          latitude: 12.8142,
          longitude: 73.9396,
          name: "Newark",
          id: "2",
          country: "United States",
          zip: "11111",
        },
      ];

      mockAxios
        .onGet("/location/suggest?query=New&limit=3")
        .reply(200, locations);

      await store.dispatch(
        fetchLocationsSuggestionsData({
          query: "New",
          limit: 3,
        }) as any,
      );

      const state = store.getState().locations;
      expect(state.suggestions.status).toBe("succeeded");
      expect(state.suggestions.data).toEqual(locations);
    });

    it("should handle fetchLocationsSuggestionsData rejected", async () => {
      mockAxios.onGet("/location/suggest?searchInput=New&limit=3").reply(404, {
        message: "Location suggestion data not found",
      });

      await store.dispatch(
        fetchLocationsSuggestionsData({
          query: "New",
          limit: 2,
        }) as any,
      );

      const state = store.getState().locations;
      expect(state.suggestions.status).toBe("failed");
      expect(state.suggestions.data).toBeNull();
    });
  });
});
