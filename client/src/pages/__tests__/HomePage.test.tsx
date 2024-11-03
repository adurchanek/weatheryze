import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "../HomePage";
import { MemoryRouter } from "react-router-dom";

describe("HomePage", () => {
  it("renders the home page heading and the SearchBar component", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    // Verify the main heading is rendered
    expect(
      screen.getByRole("heading", { name: /Weatheryze/i }),
    ).toBeInTheDocument();

    // Verify the SearchBar component is rendered by checking for the form
    expect(screen.getByLabelText("search-form")).toBeInTheDocument();
  });
});
