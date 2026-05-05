import {
  fetchGasContentPoints,
  fetchGasPressurePoints,
  fetchGasRichAreas,
} from "../../api/geoApi";

export const gasLoaders = new Map([
  [
    "gasRichAreas",
    {
      fetcher: fetchGasRichAreas,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "gasContentPoints",
    {
      fetcher: fetchGasContentPoints,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "gasPressurePoints",
    {
      fetcher: fetchGasPressurePoints,
      defaultValue: [],
      critical: false,
    },
  ],
]);
