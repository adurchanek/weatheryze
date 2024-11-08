import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "../HomePage";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../redux/store";

describe("HomePage", () => {
  it("renders the home page heading and the SearchBar component", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </Provider>,
    );

    // Verify the main heading is rendered
    expect(
      screen.getByRole("heading", { name: /Weatheryze/i }),
    ).toBeInTheDocument();

    // Verify the SearchBar component is rendered by checking for the form
    expect(screen.getByLabelText("search-form")).toBeInTheDocument();
  });
});
