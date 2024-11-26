import favoritesReducer, {
  fetchFavorites,
  deleteFavorite,
  saveFavorite,
  FavoritesState,
} from "../favoritesSlice";
import axiosInstance from "../../../services/axiosInstance";
import { configureStore, Store } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import MockAdapter from "axios-mock-adapter";

const mockAxios = new MockAdapter(axiosInstance);

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
      const favorites = [
        { _id: "1", user: "user1", location: "Location 1", date: "2023-10-01" },
        { _id: "2", user: "user1", location: "Location 2", date: "2023-10-02" },
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
        { _id: "1", user: "user1", location: "Location 1", date: "2023-10-01" },
        { _id: "2", user: "user1", location: "Location 2", date: "2023-10-02" },
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
      const newFavorite = {
        _id: "3",
        user: "user1",
        location: "Location 3",
        date: "2023-10-03",
      };

      mockAxios.onPost("/weather/favorites").reply(200, newFavorite);

      await store.dispatch(saveFavorite("Location 3") as any);

      const state = store.getState().favorites;
      expect(state.data).toEqual([newFavorite]);
    });
  });
});
