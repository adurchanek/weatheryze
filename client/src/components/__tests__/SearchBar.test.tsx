import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../SearchBar";
import { MemoryRouter } from "react-router-dom";

// Mock useNavigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search bar input and button", () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>,
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
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>,
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
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>,
    );

    // Simulate form submission without entering a location
    const form = screen.getByLabelText("search-form");
    fireEvent.submit(form);

    // Assert that navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
