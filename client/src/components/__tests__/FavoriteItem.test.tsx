import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FavoriteItem from "../FavoriteItem";
import { Location } from "../../types/location";

describe("FavoriteItem", () => {
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();

  const location: Location = {
    id: "Pennewang-AT-4",
    name: "Pennewang",
    latitude: 48.13333,
    longitude: 13.85,
    country: "Austria",
    countryCode: "AT",
    state: "Upper Austria",
    stateCode: "4",
    zip: null,
  };

  const props = {
    _id: "123",
    location,
    name: "New York",
    onView: mockOnView,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders location and buttons correctly", () => {
    render(<FavoriteItem {...props} />);

    expect(screen.getByText(/New York/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /View/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Remove Favorite/i }),
    ).toBeInTheDocument();
  });

  it("calls onView with the correct location when 'View' button is clicked", () => {
    render(<FavoriteItem {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View/i }));

    expect(mockOnView).toHaveBeenCalledWith(location);
    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete with the correct id when heart icon is clicked", async () => {
    render(<FavoriteItem {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Remove Favorite/i }));

    expect(screen.getByAltText(/Unfavoriting.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith("123");
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
