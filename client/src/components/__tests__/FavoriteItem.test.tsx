import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FavoriteItem from "../FavoriteItem";

describe("FavoriteItem", () => {
  const mockOnView = jest.fn();
  const mockOnDelete = jest.fn();

  const props = {
    id: "123",
    location: "New York",
    onView: mockOnView,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders location and buttons correctly", () => {
    render(<FavoriteItem {...props} />);

    expect(screen.getByText(/New York/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /View Weather/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
  });

  it("calls onView with correct location when 'View Weather' button is clicked", () => {
    render(<FavoriteItem {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View Weather/i }));
    expect(mockOnView).toHaveBeenCalledWith("New York");
    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete with correct id when 'Delete' button is clicked", () => {
    render(<FavoriteItem {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    expect(mockOnDelete).toHaveBeenCalledWith("123");
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
