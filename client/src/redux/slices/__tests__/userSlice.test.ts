import userReducer, {
  loginSuccess,
  logout,
  loadUserStart,
  loadUser,
  loadUserFailure,
  UserState,
} from "../userSlice";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

describe("userSlice", () => {
  const initialState: UserState = {
    isAuthenticated: false,
    userInfo: null,
    token: null,
    loading: false,
  };

  const userInfo: UserInfo = {
    _id: "123456",
    name: "Test User",
    email: "test@example.com",
  };

  const token = "fake-jwt-token";

  it("should return the initial state", () => {
    expect(userReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle loadUserStart", () => {
    const nextState = userReducer(initialState, loadUserStart());
    expect(nextState.loading).toBe(true);
  });

  it("should handle loadUser with user data", () => {
    const previousState = {
      ...initialState,
      loading: true,
    };
    const action = loadUser(userInfo);
    const expectedState = {
      isAuthenticated: true,
      userInfo,
      token: null,
      loading: false,
    };
    expect(userReducer(previousState, action)).toEqual(expectedState);
  });

  it("should handle loadUserFailure", () => {
    const previousState = {
      ...initialState,
      loading: true,
    };
    const nextState = userReducer(previousState, loadUserFailure());

    expect(nextState.loading).toBe(false);
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.userInfo).toBe(null);
  });

  it("should handle loginSuccess", () => {
    const previousState = initialState;
    const action = loginSuccess({ userInfo, token });
    const expectedState = {
      isAuthenticated: true,
      userInfo,
      token,
      loading: false,
    };
    expect(userReducer(previousState, action)).toEqual(expectedState);
    expect(localStorage.getItem("token")).toBe(token);
  });

  it("should handle logout", () => {
    localStorage.setItem("token", token);
    const previousState = {
      isAuthenticated: true,
      userInfo,
      token,
      loading: false,
    };
    const nextState = userReducer(previousState, logout());

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.userInfo).toBe(null);
    expect(nextState.token).toBe(null);
    expect(nextState.loading).toBe(false);
    expect(localStorage.getItem("token")).toBe(null);
  });

  it("should clear token from localStorage on logout", () => {
    localStorage.setItem("token", token);
    userReducer(initialState, logout());
    expect(localStorage.getItem("token")).toBe(null);
  });
});
