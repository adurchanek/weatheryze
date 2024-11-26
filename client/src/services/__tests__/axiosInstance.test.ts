import axiosInstance, { setStore } from "../axiosInstance";
import MockAdapter from "axios-mock-adapter";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";
import { RootState } from "../../redux/store";
import { UserState } from "../../redux/slices/userSlice";
import { WeatherState } from "../../types/weather";
import { FavoritesState } from "../../redux/slices/favoritesSlice";
import { ErrorState } from "../../redux/slices/errorSlice";
import { LocationState } from "../../types/location";

const mockStore = configureMockStore<RootState>([thunk]);

const defaultUserState: UserState = {
  isAuthenticated: true,
  userInfo: {
    _id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
  },
  token: "test-token-abc123",
  loading: false,
};

const defaultWeatherState: WeatherState = {
  current: {
    data: null,
    status: "idle",
  },
  forecast: {
    data: null,
    status: "idle",
  },
  currentLocation: null,
  error: null,
};

const defaultFavoritesState: FavoritesState = {
  data: null,
  status: "idle",
};

const defaultErrorState: ErrorState = {
  message: null,
};

const defaultLocationState: LocationState = {
  suggestions: {
    data: null,
    status: "idle",
  },
  error: null,
};

describe("axiosInstance Interceptors", () => {
  let store: MockStoreEnhanced<RootState, {}>;
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);

    store = mockStore({
      user: defaultUserState,
      weather: defaultWeatherState,
      favorites: defaultFavoritesState,
      error: defaultErrorState,
      location: defaultLocationState,
    });

    setStore(store);
  });

  afterEach(() => {
    mock.reset();
    store.clearActions();
  });

  it("should add Authorization header when token is present", async () => {
    // Setup mock to intercept GET request to /test
    mock.onGet("/test").reply((config) => {
      // Assert that the Authorization header is set correctly
      expect(config.headers?.Authorization).toBe("Bearer test-token-abc123");
      return [200, { success: true }];
    });

    // Make the GET request
    const response = await axiosInstance.get("/test");

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  it("should not add Authorization header when token is absent", async () => {
    // Update the store to have no token and unauthenticated
    const unauthenticatedUserState: UserState = {
      isAuthenticated: false,
      userInfo: null,
      token: null,
      loading: false,
    };

    // Reinitialize the store with unauthenticated user and default states for other slices
    store = mockStore({
      user: unauthenticatedUserState,
      weather: defaultWeatherState,
      favorites: defaultFavoritesState,
      error: defaultErrorState,
      location: defaultLocationState,
    });

    // Set the updated store
    setStore(store);

    // Setup mock to intercept GET request to /test
    mock.onGet("/test").reply((config) => {
      // Assert that the Authorization header is not set
      expect(config.headers?.Authorization).toBeUndefined();
      return [200, { success: true }];
    });

    // Make the GET request
    const response = await axiosInstance.get("/test");

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  it("should handle request errors gracefully", async () => {
    // Setup mock to simulate a network error
    mock.onGet("/test").networkError();

    // Make the GET request and expect it to reject
    await expect(axiosInstance.get("/test")).rejects.toThrow("Network Error");
  });
});
