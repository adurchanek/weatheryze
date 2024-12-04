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

const mockAxios = new MockAdapter(axiosInstance);

const mockNavigate = jest.fn();

jest.mock("../../utils/getBaseUrl", () => ({
  getBaseUrl: jest.fn(() => ""),
}));

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

  it("navigates to the correct URL when a valid location is submitted", async () => {
    const suggestions = [
      {
        id: "48.13333-13.85",
        name: "Pennewang",
        latitude: 48.13333,
        longitude: 13.85,
        country: "Austria",
        countryCode: "AT",
        state: "Upper Austria",
        stateCode: "4",
        zip: null,
      },
    ];

    // Mock the API response for fetching suggestions
    mockAxios
      .onGet("/location/suggest?query=Pennewang&limit=5")
      .reply(200, suggestions);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Pennewang" } });
    });

    // Wait for suggestions to load
    await waitFor(() => {
      expect(screen.getByText(/Pennewang/i)).toBeInTheDocument();
    });

    // Simulate form submission
    const form = screen.getByLabelText("search-form");
    fireEvent.submit(form);

    // Assert that navigate was called with the correct URL
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/weather/48.13333-13.85");
    });
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

    // Mock the API response
    mockAxios
      .onGet("/location/suggest?query=New&limit=5")
      .reply(200, suggestions);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "New" } });
    });

    // Assert that the suggestions are displayed with all relevant details
    await waitFor(() => {
      // Check for the first suggestion
      const firstSuggestion = screen.getByText(/Pennewang/i);
      expect(firstSuggestion).toBeInTheDocument();
      expect(screen.getByText(/Upper Austria/i)).toBeInTheDocument();
      expect(screen.getByText(/\(Austria\)/i)).toBeInTheDocument();

      // Check for the second suggestion
      const secondSuggestion = screen.getByText(/New Lambton/i);
      expect(secondSuggestion).toBeInTheDocument();
      expect(screen.getByText(/New South Wales/i)).toBeInTheDocument();
      expect(screen.getByText(/\(Australia\)/i)).toBeInTheDocument();
    });
  });

  it("renders error message when fetch fails", async () => {
    mockAxios
      .onGet("/location/suggest?query=New&limit=5")
      .reply(500, { message: "Internal Server Error" });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "New" } });
    });

    // Assert error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
    });
  });

  it("renders 'Location not found' when no suggestions are available", async () => {
    mockAxios.onGet("/location/suggest?query=Unknown&limit=5").reply(200, []);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Unknown" } });
    });

    // Assert 'Location not found' message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Location not found/i)).toBeInTheDocument();
    });
  });

  it("does not show dropdown when input is empty", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user clearing the input
    const input = screen.getByLabelText("location-input");
    fireEvent.change(input, { target: { value: "" } });

    // Assert dropdown is not displayed
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("hides the dropdown when clicking outside of the search bar", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    // Simulate user typing a location
    const input = screen.getByLabelText("location-input");
    await act(async () => {
      fireEvent.change(input, { target: { value: "Pennewang" } });
    });

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);

    // Assert dropdown is not displayed
    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  it("closes the dropdown when the input is cleared", async () => {
    // Mock successful API response
    mockAxios.onGet("/location/suggest?query=Pennewang&limit=5").reply(200, [
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
    ]);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    const input = screen.getByLabelText("location-input");

    // Simulate user typing a location
    await act(async () => {
      fireEvent.change(input, { target: { value: "Pennewang" } });
    });

    // Assert that the dropdown is visible
    await waitFor(() => {
      expect(screen.getByText(/Pennewang/i)).toBeInTheDocument();
    });

    // Simulate clearing the input
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
    });

    // Assert that the dropdown is no longer visible
    await waitFor(() => {
      expect(screen.queryByText(/Pennewang/i)).not.toBeInTheDocument();
    });
  });

  it("displays loading indicator only while fetching", async () => {
    mockAxios
      .onGet("/location/suggest?query=New&limit=5")
      .reply(
        () =>
          new Promise((resolve) => setTimeout(() => resolve([200, []]), 500)),
      );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    const input = screen.getByLabelText("location-input");

    // Simulate user typing a location
    await act(async () => {
      fireEvent.change(input, { target: { value: "New" } });
    });

    // Assert that the loading indicator is visible
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for the API response
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  it("navigates to the weather page when a suggestion is clicked", async () => {
    const suggestions: Location[] = [
      {
        id: "48.13333-13.85",
        name: "Pennewang",
        latitude: 48.13333,
        longitude: 13.85,
        country: "Austria",
        countryCode: "AT",
        state: "Upper Austria",
        stateCode: "4",
        zip: null,
      },
    ];

    mockAxios
      .onGet("/location/suggest?query=New&limit=5")
      .reply(200, suggestions);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>,
    );

    const input = screen.getByLabelText("location-input");

    // Simulate user typing
    await act(async () => {
      fireEvent.change(input, { target: { value: "New" } });
    });

    // Click on the suggestion
    await waitFor(() => {
      const suggestion = screen.getByText(/Pennewang/i);
      fireEvent.mouseDown(suggestion);
    });

    // Assert that navigate was called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/weather/48.13333-13.85");
    });
  });
});
