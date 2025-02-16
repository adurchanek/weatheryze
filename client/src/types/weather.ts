import { Location } from "./location";

export interface CurrentWeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  windDirection: number;
}

export interface DailyWeatherData {
  temperature2mMax: { [key: string]: number };
  temperature2mMin: { [key: string]: number };
}

export interface DailyWeather {
  daily: DailyWeatherData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface ForecastHourlyData {
  time: string[];
  temperature2m: { [key: string]: number };
}

export interface CurrentWeatherSummary {
  weather: CurrentWeatherData;
  summary: string;
}

export interface ForecastData {
  hourly: ForecastHourlyData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface WindSpeedHourlyData {
  time: string[];
  windSpeed10m: { [key: string]: number };
}

export interface WindSpeedData {
  hourly: WindSpeedHourlyData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface AirQualityBreakdown {
  [pollutant: string]: {
    aqi: number;
    label: string;
  };
}

export interface CurrentAirQualityData {
  overallAQI: number;
  overallLabel: string;
  breakdown: AirQualityBreakdown;
}

export interface WeatherState {
  currentWeather: {
    data: CurrentWeatherSummary | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  dailyWeather: {
    data: DailyWeather | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  forecast: {
    data: ForecastData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  precipitation: {
    data: PrecipitationData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  windSpeed: {
    data: WindSpeedData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  dailyWind: {
    data: WindData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  precipitationChanceData: {
    data: PrecipitationChanceData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  temperatureData: {
    data: TemperatureData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  conditionData: {
    data: ConditionData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
  };
  currentAirQuality: {
    data: CurrentAirQualityData | null;
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

export interface PrecipitationData {
  hourly: {
    time: string[];
    rain: { [key: string]: number };
    snowfall: { [key: string]: number };
  };
  utcOffsetSeconds: number;
  timezone: string;
}

export interface WindData {
  hourly: {
    time: string[];
    windDirection10m: { [key: string]: number };
    windSpeed10m: { [key: string]: number };
  };
  utcOffsetSeconds: number;
  timezone: string;
}

export interface PrecipitationChanceHourlyData {
  time: string[];
  precipitationChance: { [key: string]: number };
}

export interface PrecipitationChanceData {
  hourly: PrecipitationChanceHourlyData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface TemperatureHourlyData {
  time: string[];
  temperature2m: { [key: string]: number };
}

export interface TemperatureData {
  hourly: TemperatureHourlyData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface ConditionHourlyData {
  time: string[];
  condition: { [key: string]: string };
}

export interface ConditionData {
  hourly: ConditionHourlyData;
  utcOffsetSeconds: number;
  timezone: string;
}

export interface ConditionToIconMap {
  Sunny: string;
  Foggy: string;
  Rainy: string;
  Scattered: string;
  Sleet: string;
  Snowy: string;
  Thunderstorms: string;
  Cloudy: string;
  Unknown: string;
}

export enum TimeState {
  Past = "Past",
  Present = "Present",
  Future = "Future",
}
