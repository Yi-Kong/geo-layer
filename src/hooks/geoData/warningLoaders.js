import {
  fetchMeasurePoints,
  fetchRiskRanges,
  fetchWarnings,
} from "../../api/geoApi";

export const warningLoaders = new Map([
  [
    "warningPoints",
    {
      fetcher: fetchWarnings,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "riskRanges",
    {
      fetcher: fetchRiskRanges,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "measurePoints",
    {
      fetcher: fetchMeasurePoints,
      defaultValue: [],
      critical: false,
    },
  ],
]);
