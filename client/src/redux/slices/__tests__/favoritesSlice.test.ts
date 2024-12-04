import favoritesReducer, {
  fetchFavorites,
  deleteFavorite,
  saveFavorite,
} from "../favoritesSlice";
import axiosInstance from "../../../services/axiosInstance";
import { configureStore, Store } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";
import { FavoriteLocation, FavoritesState } from "../../../types/favorites";

const mockAxios = new MockAdapter(axiosInstance);

jest.mock("../../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

describe("favoritesSlice", () => {
  const initialState: FavoritesState = {
    data: null,
    status: "idle",
  };

  let store: Store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        favorites: favoritesReducer,
      },
      middleware: [thunk],
    });

    mockAxios.reset();
  });

  it("should return the initial state", () => {
    expect(favoritesReducer(undefined, { type: String })).toEqual(initialState);
  });

  describe("fetchFavorites", () => {
    it("should handle fetchFavorites pending", () => {
      const action = { type: fetchFavorites.pending.type };
      const state = favoritesReducer(initialState, action);
      expect(state.status).toBe("loading");
    });

    it("should handle fetchFavorites fulfilled", async () => {
      const favorites: FavoriteLocation[] = [
        {
          _id: "1",
          user: "user1",
          name: "Location 1",
          latitude: 40.7128,
          longitude: -74.006,
          date: "2023-10-01",
          id: "40.7128,-74.006",
          country: "United States",
          countryCode: "US",
          state: "New York",
          stateCode: "NY",
          zip: null,
        },
        {
          _id: "2",
          user: "user1",
          name: "Location 2",
          latitude: 45.7128,
          longitude: -85.006,
          date: "2023-10-02",
          id: "40.7128,-74.006",
          country: "United States",
          countryCode: "US",
          state: "New York",
          stateCode: "NY",
          zip: null,
        },
      ];

      mockAxios.onGet("/weather/favorites").reply(200, favorites);

      await store.dispatch(fetchFavorites() as any);

      const state = store.getState().favorites;
      expect(state.status).toBe("succeeded");
      expect(state.data).toEqual(favorites);
    });

    it("should handle fetchFavorites rejected", async () => {
      mockAxios.onGet("/weather/favorites").reply(500);

      await store.dispatch(fetchFavorites() as any);

      const state = store.getState().favorites;
      expect(state.status).toBe("failed");
      expect(state.data).toBeNull();
    });
  });

  describe("deleteFavorite", () => {
    it("should handle deleteFavorite fulfilled", async () => {
      const initialData = [
        {
          _id: "1",
          user: "user1",
          name: "Location 1",
          latitude: 40.7128,
          longitude: -74.006,
          id: "40.7128,-74.006",
          country: "United States",
          countryCode: "US",
          state: "New York",
          stateCode: "NY",
          zip: null,
          date: "2023-10-01",
        },
        {
          _id: "2",
          user: "user1",
          name: "Location 2",
          latitude: 45.7128,
          longitude: -85.006,
          id: "80.6128,-34.306",
          country: "United States",
          countryCode: "US",
          state: "California",
          stateCode: "CA",
          zip: "90001",
          date: "2023-10-02",
        },
      ];

      store = configureStore({
        reducer: {
          favorites: favoritesReducer,
        },
        middleware: [thunk],
        preloadedState: {
          favorites: {
            data: initialData,
            status: "succeeded",
          },
        },
      });

      mockAxios.onDelete("/weather/favorites/1").reply(200);

      await store.dispatch(deleteFavorite("1") as any);

      const state = store.getState().favorites;
      expect(state.data).toEqual([initialData[1]]);
    });
  });

  describe("saveFavorite", () => {
    it("should handle saveFavorite fulfilled", async () => {
      const newFavorite: FavoriteLocation = {
        _id: "3",
        user: "user1",
        latitude: 40.7128,
        longitude: -74.006,
        name: "New York",
        date: "2023-10-03",
        id: "40.7128,-74.006",
        country: "United States",
        countryCode: "US",
        state: "New York",
        stateCode: "NY",
        zip: null,
      };

      mockAxios.onPost("/weather/favorites").reply(200, newFavorite);

      await store.dispatch(
        saveFavorite({
          location: {
            latitude: 40.7128,
            longitude: -74.006,
            name: "New York",
            id: "40.7128,-74.006",
            country: "United States",
            countryCode: "US",
            state: "New York",
            stateCode: "NY",
            zip: "10001",
          },
        }) as any,
      );

      const state = store.getState().favorites;

      // Assert that the state includes the new favorite
      expect(state.data).toEqual([newFavorite]);
    });
  });
});
