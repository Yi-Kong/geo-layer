import { fetchWarnings } from "../../api/geoApi";

export const warningLoaders = new Map([
  [
    "warningPoints",
    {
      fetcher: fetchWarnings,
      defaultValue: [],
      critical: false,
    },
  ],
]);
