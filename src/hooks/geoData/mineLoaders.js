import { fetchMine } from "../../api/geoApi";

export const mineLoaders = new Map([
  [
    "mineInfo",
    {
      fetcher: fetchMine,
      defaultValue: null,
      critical: true,
    },
  ],
]);
