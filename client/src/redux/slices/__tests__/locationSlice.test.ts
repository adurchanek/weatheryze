import locationsReducer, {
  fetchLocationsSuggestionsData,
} from "../locationSlice";
import axiosInstance from "../../../services/axiosInstance";
import { configureStore, Store } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";
import { Location, LocationState } from "../../../types/location";

const mockAxios = new MockAdapter(axiosInstance);

jest.mock("../../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

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
    store = configureStore({
      reducer: {
        location: locationsReducer,
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
      const suggestions: Location[] = [
        {
          id: "Pennewang-AT-4",
          name: "Pennewang",
          latitude: 48.13333,
          longitude: 13.85,
          country: "Austria",
          countryCode: "AT",
          state: "Upper Austria",
          stateCode: "4",
          zip: null,
        },
        {
          id: "New Lambton-AU-NSW",
          name: "New Lambton",
          latitude: -32.92838,
          longitude: 151.7085,
          country: "Australia",
          countryCode: "AU",
          state: "New South Wales",
          stateCode: "NSW",
          zip: null,
        },
      ];

      mockAxios
        .onGet("/location/suggest?query=New&limit=3")
        .reply(200, suggestions);

      await store.dispatch(
        fetchLocationsSuggestionsData({
          query: "New",
          limit: 3,
        }) as any,
      );

      const state = store.getState().location;
      expect(state.suggestions.status).toBe("succeeded");
      expect(state.suggestions.data).toEqual(suggestions);
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

      const state = store.getState().location;
      expect(state.suggestions.status).toBe("failed");
      expect(state.suggestions.data).toBeNull();
    });
  });
});
