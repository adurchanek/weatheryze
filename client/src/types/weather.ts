import { Location } from "./location";

export interface CurrentWeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

export interface ForecastHourlyData {
  time: string[];
  temperature2m: { [key: string]: number };
}

export interface ForecastData {
  hourly: ForecastHourlyData;
}

export interface WeatherState {
  current: {
    data: CurrentWeatherData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  forecast: {
    data: ForecastData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  currentLocation: Location | null;
  error: string | null;
}

export interface CoordinatesParams {
  latitude: number;
  longitude: number;
  timezone: string;
}
