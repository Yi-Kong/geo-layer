import { useEffect, useState } from "react";
import { geoDataDefaults, geoDataLoaders, loadGeoConfig } from "./geoData";

async function loadGeoDataEntries(loaderEntries) {
  const settledResults = await Promise.allSettled(
    loaderEntries.map(async ([key, loader]) => {
      const value = await loader.fetcher();
      return [key, value];
    })
  );

  const nextGeoData = { ...geoDataDefaults };
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

  return {
    nextGeoData,
    failedLoaders,
  };
}

function groupGeoDataFailures(failedLoaders) {
  return {
    criticalFailures: failedLoaders.filter((item) => item.critical),
    nonCriticalFailures: failedLoaders.filter((item) => !item.critical),
  };
}

function reportGeoDataFailures({ criticalFailures, nonCriticalFailures }) {
  if (nonCriticalFailures.length > 0) {
    console.warn("Non-critical geo data failed to load:", nonCriticalFailures);
  }

  if (criticalFailures.length > 0) {
    console.error("Critical geo data failed to load:", criticalFailures);
  }
}

function createCriticalGeoDataError(criticalFailures) {
  return new Error(
    `关键地质数据加载失败：${criticalFailures
      .map((item) => item.key)
      .join(", ")}`
  );
}

async function loadOptionalGeoConfig() {
  try {
    return await loadGeoConfig();
  } catch (error) {
    console.warn("Optional geo config failed to load:", error);
    return null;
  }
}

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
        const [{ nextGeoData, failedLoaders }] = await Promise.all([
          loadGeoDataEntries(loaderEntries),
          loadOptionalGeoConfig(),
        ]);
        const { criticalFailures, nonCriticalFailures } =
          groupGeoDataFailures(failedLoaders);

        reportGeoDataFailures({ criticalFailures, nonCriticalFailures });

        if (!cancelled) {
          if (criticalFailures.length > 0) {
            setError(createCriticalGeoDataError(criticalFailures));
          }

          setGeoData(nextGeoData);
        }
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
