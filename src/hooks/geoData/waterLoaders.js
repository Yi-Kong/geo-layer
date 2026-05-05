import {
  fetchAquifers,
  fetchGoafWaterAreas,
  fetchWaterInrushPoints,
  fetchWaterRichAreas,
} from "../../api/geoApi";

export const waterLoaders = new Map([
  [
    "aquifers",
    {
      fetcher: fetchAquifers,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "goafWaterAreas",
    {
      fetcher: fetchGoafWaterAreas,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "waterInrushPoints",
    {
      fetcher: fetchWaterInrushPoints,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "waterRichAreas",
    {
      fetcher: fetchWaterRichAreas,
      defaultValue: [],
      critical: false,
    },
  ],
]);
