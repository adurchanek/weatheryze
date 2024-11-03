import errorReducer, { setError, clearError } from "../errorSlice";

describe("errorSlice", () => {
  const initialState = {
    message: null,
  };

  it("should return the initial state", () => {
    expect(errorReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it("should handle setError", () => {
    const errorMessage = "An error occurred";
    const action = setError(errorMessage);
    const expectedState = {
      message: errorMessage,
    };
    expect(errorReducer(initialState, action)).toEqual(expectedState);
  });

  it("should handle clearError", () => {
    const previousState = {
      message: "An error occurred",
    };
    const action = clearError();
    expect(errorReducer(previousState, action)).toEqual(initialState);
  });
});
