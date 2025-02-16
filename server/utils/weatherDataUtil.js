import forecastDataOneDay from "./data/forecastDataOneDay.js";
import forecastDataThreeDay from "./data/forecastDataThreeDay.js";
import forecastDataSevenDay from "./data/forecastDataSevenDay.js";
import forecastDataFourteenDay from "./data/forecastDataFourteenDay.js";
import precipitationDataOneDay from "./data/precipitationDataOneDay.js";
import precipitationDataThreeDay from "./data/precipitationDataThreeDay.js";
import precipitationDataSevenDay from "./data/precipitationDataSevenDay.js";
import precipitationDataFourteenDay from "./data/precipitationDataFourteenDay.js";
import { windDataOneDay } from "./data/windDataOneDay.js";
import { windDataThreeDay } from "./data/windDataThreeDay.js";
import { windDataSevenDay } from "./data/windDataSevenDay.js";
import { windDataFourteenDay } from "./data/windDataFourteenDay.js";
import { precipitationChanceOneDay } from "./data/precipitationChanceOneDay.js";

export const getForecastDataByDay = (forecast_days) => {
  switch (forecast_days) {
    case "1":
      return forecastDataOneDay;
    case "3":
      return forecastDataThreeDay;
    case "7":
      return forecastDataSevenDay;
    case "14":
      return forecastDataFourteenDay;
  }
  return forecastDataOneDay;
};

export const getPrecipitationDataByDay = (forecast_days) => {
  switch (forecast_days) {
    case "1":
      return precipitationDataOneDay;
    case "3":
      return precipitationDataThreeDay;
    case "7":
      return precipitationDataSevenDay;
    case "14":
      return precipitationDataFourteenDay;
  }
  return precipitationDataOneDay;
};

export const getWindDataByDay = (forecast_days) => {
  switch (forecast_days) {
    case "1":
      return windDataOneDay;
    case "3":
      return windDataThreeDay;
    case "7":
      return windDataSevenDay;
    case "14":
      return windDataFourteenDay;
  }
  return windDataOneDay;
};

export const getPrecipitationChanceByDay = (forecast_days) => {
  switch (forecast_days) {
    case "1":
      return precipitationChanceOneDay;
    case "3":
      return precipitationChanceOneDay;
    case "7":
      return precipitationChanceOneDay;
    case "14":
      return precipitationChanceOneDay;
  }
  return precipitationChanceOneDay;
};
