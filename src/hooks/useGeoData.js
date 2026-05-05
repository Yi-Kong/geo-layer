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

        const loaderEntries = [...geoDataLoaders.entries()];
        const [settledResults, warningRulesData, treatmentMeasuresData] =
          await Promise.all([
            Promise.allSettled(
              loaderEntries.map(async ([key, loader]) => {
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

        const nextGeoData = {};
        const failedLoaders = [];

        settledResults.forEach((result, index) => {
          const [key, loader] = loaderEntries[index];

          if (result.status === "fulfilled") {
            const [, value] = result.value;
            nextGeoData[key] = value;
            return;
          }

          nextGeoData[key] = loader.defaultValue;
          failedLoaders.push({
            key,
            critical: Boolean(loader.critical),
            reason: result.reason,
          });
        });

        const criticalFailures = failedLoaders.filter((item) => item.critical);
        const nonCriticalFailures = failedLoaders.filter(
          (item) => !item.critical
        );

        if (nonCriticalFailures.length > 0) {
          console.warn(
            "Non-critical geo data failed to load:",
            nonCriticalFailures
          );
        }

        if (criticalFailures.length > 0) {
          console.error("Critical geo data failed to load:", criticalFailures);
          setError(
            new Error(
              `关键地质数据加载失败：${criticalFailures
                .map((item) => item.key)
                .join(", ")}`
            )
          );
        }

        setGeoData(nextGeoData);
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
