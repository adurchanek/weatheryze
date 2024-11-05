import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotFound from "../NotFound";

describe("NotFound Component", () => {
  it("renders the 404 message", () => {
    render(<NotFound />);

    // Check if the main heading is displayed
    expect(
      screen.getByRole("heading", { name: /404 - Page Not Found/i }),
    ).toBeInTheDocument();
  });
});
