import {
  fetchAbandonedShafts,
  fetchFaultInfluenceZones,
  fetchGoafAreas,
  fetchPoorSealedBoreholes,
  fetchRiskBodies,
  fetchSmallMineDamageAreas,
} from "../../api/geoApi";

export const riskLoaders = new Map([
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
    "riskBodies",
    {
      fetcher: fetchRiskBodies,
      defaultValue: [],
      critical: true,
    },
  ],
]);
