import {
  fetchMiningPaths,
  fetchTunnels,
  fetchWorkingFaces,
} from "../../api/geoApi";

export const productionLoaders = new Map([
  [
    "workingFaces",
    {
      fetcher: fetchWorkingFaces,
      defaultValue: [],
      critical: true,
    },
  ],
  [
    "tunnels",
    {
      fetcher: fetchTunnels,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "miningPaths",
    {
      fetcher: fetchMiningPaths,
      defaultValue: [],
      critical: false,
    },
  ],
]);
