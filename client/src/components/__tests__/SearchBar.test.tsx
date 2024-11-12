import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../SearchBar";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../redux/store";
import { Location } from "../../types/location";
import axiosInstance from "../../services/axiosInstance";
import MockAdapter from "axios-mock-adapter";

// Mock axiosInstance
const mockAxios = new MockAdapter(axiosInstance);

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.reset();
  });

  it("renders the search bar input and button", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Check for the input field
    expect(
      screen.getByPlaceholderText(/Enter a location/i),
    ).toBeInTheDocument();

    // Check for the search button
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });

  it("navigates to the correct URL when a valid location is submitted", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    fireEvent.change(input, { target: { value: "New York" } });

    // Simulate form submission
    const form = screen.getByLabelText("search-form");
    fireEvent.submit(form);

    // Assert that navigate was called with the correct URL
    expect(mockNavigate).toHaveBeenCalledWith("/weather/New%20York");
  });

  it("does not navigate when the input is empty or only contains whitespace", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate form submission without entering a location
    const form = screen.getByLabelText("search-form");
    fireEvent.submit(form);

    // Assert that navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays suggested locations after successful fetch", async () => {
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
      .onGet("/location/suggest?query=New&limit=5")
      .reply(200, locations);

    await act(async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <SearchBar />
          </MemoryRouter>
        </Provider>,
      );
    });

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    fireEvent.change(input, { target: { value: "New" } });

    // Simulate form submission
    const form = screen.getByLabelText("search-form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/New York/i)).toBeInTheDocument();
      expect(screen.getByText(/Newark/i)).toBeInTheDocument();
    });
  });
});
