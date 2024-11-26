import request from "supertest";
import app from "../app.js";
import { jest } from "@jest/globals";
import fetchLocations from "../services/locationService.js";

// Mock the fetchLocations service
jest.mock("../services/locationService.js");

describe("Location Routes", () => {
  describe("GET /api/location/suggest", () => {
    it("returns a list of locations matching the query", async () => {
      // Mock the service to return dummy data
      fetchLocations.mockResolvedValueOnce([
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
      ]);

      const res = await request(app)
        .get("/api/location/suggest")
        .query({ query: "New", limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toEqual({
        id: "Pennewang-AT-4",
        name: "Pennewang",
        latitude: 48.13333,
        longitude: 13.85,
        country: "Austria",
        countryCode: "AT",
        state: "Upper Austria",
        stateCode: "4",
        zip: null,
      });
      expect(res.body[1]).toEqual({
        id: "New Lambton-AU-NSW",
        name: "New Lambton",
        latitude: -32.92838,
        longitude: 151.7085,
        country: "Australia",
        countryCode: "AU",
        state: "New South Wales",
        stateCode: "NSW",
        zip: null,
      });
    });

    it("returns a 400 error if query is not provided", async () => {
      const res = await request(app).get("/api/location/suggest");

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Search query is required");
    });

    it("returns a 500 error if the service throws an error", async () => {
      // Mock the service to throw an error
      fetchLocations.mockRejectedValueOnce(new Error("Service error"));

      const res = await request(app)
        .get("/api/location/suggest")
        .query({ query: "New" });

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe("Server error");
    });

    it("limits the number of results based on the limit query parameter", async () => {
      // Mock the service to return more than 2 results
      fetchLocations.mockResolvedValueOnce([
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
        {
          id: "New Orleans-US-LA",
          name: "New Orleans",
          latitude: 29.9511,
          longitude: -90.0715,
          country: "United States",
          countryCode: "US",
          state: "Louisiana",
          stateCode: "LA",
          zip: "70112",
        },
      ]);

      const res = await request(app)
        .get("/api/location/suggest")
        .query({ query: "New", limit: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2); // Validate limit
      expect(res.body[0]).toEqual({
        id: "Pennewang-AT-4",
        name: "Pennewang",
        latitude: 48.13333,
        longitude: 13.85,
        country: "Austria",
        countryCode: "AT",
        state: "Upper Austria",
        stateCode: "4",
        zip: null,
      });
      expect(res.body[1]).toEqual({
        id: "New Lambton-AU-NSW",
        name: "New Lambton",
        latitude: -32.92838,
        longitude: 151.7085,
        country: "Australia",
        countryCode: "AU",
        state: "New South Wales",
        stateCode: "NSW",
        zip: null,
      });
    });
  });
});
