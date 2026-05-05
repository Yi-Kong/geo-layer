import {
  fetchAbandonedShafts,
  fetchFaultInfluenceZones,
  fetchGoafAreas,
  fetchMeasurePoints,
  fetchPoorSealedBoreholes,
  fetchRiskBodies,
  fetchRiskRanges,
  fetchSmallMineDamageAreas,
  fetchSoftLayers,
} from "../../api/geoApi";

export const riskLoaders = new Map([
  [
    "softLayers",
    {
      fetcher: fetchSoftLayers,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "smallMineDamageAreas",
    {
      fetcher: fetchSmallMineDamageAreas,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "goafAreas",
    {
      fetcher: fetchGoafAreas,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "abandonedShafts",
    {
      fetcher: fetchAbandonedShafts,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "poorSealedBoreholes",
    {
      fetcher: fetchPoorSealedBoreholes,
      defaultValue: [],
      critical: false,
    },
  ],
  [
    "faultInfluenceZones",
    {
      fetcher: fetchFaultInfluenceZones,
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
  [
    "riskBodies",
    {
      fetcher: fetchRiskBodies,
      defaultValue: [],
      critical: true,
    },
  ],
]);
