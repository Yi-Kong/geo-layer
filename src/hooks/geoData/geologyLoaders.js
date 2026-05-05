import {
  fetchBoreholes,
  fetchCoalSeams,
  fetchCollapseColumns,
  fetchFaults,
  fetchStrata,
} from "../../api/geoApi";

export const geologyLoaders = new Map([
  [
    "strata",
    {
      fetcher: fetchStrata,
      defaultValue: [],
      critical: true,
    },
  ],
  [
    "coalSeams",
    {
      fetcher: fetchCoalSeams,
      defaultValue: [],
      critical: true,
    },
  ],
  [
    "boreholes",
    {
      fetcher: fetchBoreholes,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "faults",
    {
      fetcher: fetchFaults,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "collapseColumns",
    {
      fetcher: fetchCollapseColumns,
      defaultValue: [],
      critical: false,
    },
  ],
]);
