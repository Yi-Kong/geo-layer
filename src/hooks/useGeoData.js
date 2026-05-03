import { useEffect, useState } from "react";
import {
  fetchAbandonedShafts,
  fetchAquifers,
  fetchBoreholes,
  fetchCoalSeams,
  fetchCollapseColumns,
  fetchFaultInfluenceZones,
  fetchFaults,
  fetchGasContentPoints,
  fetchGasPressurePoints,
  fetchGasRichAreas,
  fetchGoafAreas,
  fetchGoafWaterAreas,
  fetchMeasurePoints,
  fetchMine,
  fetchMiningPaths,
  fetchPoorSealedBoreholes,
  fetchRiskBodies,
  fetchRiskRanges,
  fetchSmallMineDamageAreas,
  fetchSoftLayers,
  fetchStrata,
  fetchTunnels,
  fetchTreatmentMeasures,
  fetchWarningRules,
  fetchWarnings,
  fetchWaterInrushPoints,
  fetchWaterRichAreas,
  fetchWorkingFaces,
} from "../api/geoApi";
import { setTreatmentMeasures } from "../services/measureService";
import { setWarningRules } from "../services/warningService";

const initialGeoData = {
  mineInfo: null,
  strata: [],
  coalSeams: [],
  boreholes: [],
  faults: [],
  collapseColumns: [],
  workingFaces: [],
  tunnels: [],
  miningPaths: [],
  aquifers: [],
  goafWaterAreas: [],
  waterInrushPoints: [],
  waterRichAreas: [],
  gasRichAreas: [],
  gasContentPoints: [],
  gasPressurePoints: [],
  softLayers: [],
  smallMineDamageAreas: [],
  goafAreas: [],
  abandonedShafts: [],
  poorSealedBoreholes: [],
  faultInfluenceZones: [],
  warningPoints: [],
  riskRanges: [],
  measurePoints: [],
  riskBodies: [],
};

export function useGeoData() {
  const [geoData, setGeoData] = useState(initialGeoData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGeoData() {
      try {
        setLoading(true);
        setError(null);

        const [
          mineInfoData,
          strataData,
          coalSeamsData,
          boreholesData,
          faultsData,
          collapseColumnsData,
          workingFacesData,
          tunnelsData,
          miningPathsData,
          aquifersData,
          goafWaterAreasData,
          waterInrushPointsData,
          waterRichAreasData,
          gasRichAreasData,
          gasContentPointsData,
          gasPressurePointsData,
          softLayersData,
          smallMineDamageAreasData,
          goafAreasData,
          abandonedShaftsData,
          poorSealedBoreholesData,
          faultInfluenceZonesData,
          warningPointsData,
          riskRangesData,
          measurePointsData,
          riskBodiesData,
          warningRulesData,
          treatmentMeasuresData,
        ] = await Promise.all([
          fetchMine(),
          fetchStrata(),
          fetchCoalSeams(),
          fetchBoreholes(),
          fetchFaults(),
          fetchCollapseColumns(),
          fetchWorkingFaces(),
          fetchTunnels(),
          fetchMiningPaths(),
          fetchAquifers(),
          fetchGoafWaterAreas(),
          fetchWaterInrushPoints(),
          fetchWaterRichAreas(),
          fetchGasRichAreas(),
          fetchGasContentPoints(),
          fetchGasPressurePoints(),
          fetchSoftLayers(),
          fetchSmallMineDamageAreas(),
          fetchGoafAreas(),
          fetchAbandonedShafts(),
          fetchPoorSealedBoreholes(),
          fetchFaultInfluenceZones(),
          fetchWarnings(),
          fetchRiskRanges(),
          fetchMeasurePoints(),
          fetchRiskBodies(),
          fetchWarningRules(),
          fetchTreatmentMeasures(),
        ]);

        if (cancelled) {
          return;
        }

        setWarningRules(warningRulesData);
        setTreatmentMeasures(treatmentMeasuresData);
        setGeoData({
          mineInfo: mineInfoData,
          strata: strataData,
          coalSeams: coalSeamsData,
          boreholes: boreholesData,
          faults: faultsData,
          collapseColumns: collapseColumnsData,
          workingFaces: workingFacesData,
          tunnels: tunnelsData,
          miningPaths: miningPathsData,
          aquifers: aquifersData,
          goafWaterAreas: goafWaterAreasData,
          waterInrushPoints: waterInrushPointsData,
          waterRichAreas: waterRichAreasData,
          gasRichAreas: gasRichAreasData,
          gasContentPoints: gasContentPointsData,
          gasPressurePoints: gasPressurePointsData,
          softLayers: softLayersData,
          smallMineDamageAreas: smallMineDamageAreasData,
          goafAreas: goafAreasData,
          abandonedShafts: abandonedShaftsData,
          poorSealedBoreholes: poorSealedBoreholesData,
          faultInfluenceZones: faultInfluenceZonesData,
          warningPoints: warningPointsData,
          riskRanges: riskRangesData,
          measurePoints: measurePointsData,
          riskBodies: riskBodiesData,
        });
      } catch (error) {
        console.error("Failed to load geo data:", error);

        if (!cancelled) {
          setError(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGeoData();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...geoData,
    loading,
    error,
  };
}
