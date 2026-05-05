import { useEffect, useState } from "react";
import { fetchTreatmentMeasures, fetchWarningRules } from "../api/geoApi";
import { setTreatmentMeasures } from "../services/measureService";
import { setWarningRules } from "../services/warningService";
import { geoDataDefaults, geoDataLoaders } from "./geoData";

export function useGeoData() {
  const [geoData, setGeoData] = useState(geoDataDefaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGeoData() {
      try {
        setLoading(true);
        setError(null);

        const [dataEntries, warningRulesData, treatmentMeasuresData] =
          await Promise.all([
            Promise.all(
              [...geoDataLoaders.entries()].map(async ([key, loader]) => {
                const value = await loader.fetcher();
                return [key, value];
              })
            ),
            fetchWarningRules(),
            fetchTreatmentMeasures(),
          ]);

        if (cancelled) {
          return;
        }

        setWarningRules(warningRulesData);
        setTreatmentMeasures(treatmentMeasuresData);
        setGeoData(Object.fromEntries(dataEntries));
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
