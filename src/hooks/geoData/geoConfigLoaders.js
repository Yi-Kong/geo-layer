import {
  fetchTreatmentMeasures,
  fetchWarningRules,
} from "../../api/geoApi";
import { setTreatmentMeasures } from "../../services/measureService";
import { setWarningRules } from "../../services/warningService";

const geoConfigLoaders = [
  {
    key: "warningRules",
    fetcher: fetchWarningRules,
    apply: setWarningRules,
  },
  {
    key: "treatmentMeasures",
    fetcher: fetchTreatmentMeasures,
    apply: setTreatmentMeasures,
  },
];

async function loadConfigEntry({ key, fetcher, apply }) {
  const value = await fetcher();
  apply(value);

  return {
    key,
    value,
  };
}

export async function loadGeoConfig() {
  const settledResults = await Promise.allSettled(
    geoConfigLoaders.map((loader) => loadConfigEntry(loader))
  );

  const loadedConfigs = [];
  const failedConfigs = [];

  settledResults.forEach((result, index) => {
    const { key } = geoConfigLoaders[index];

    if (result.status === "fulfilled") {
      loadedConfigs.push(result.value.key);
      return;
    }

    failedConfigs.push({
      key,
      reason: result.reason,
    });
  });

  if (failedConfigs.length > 0) {
    console.warn("Geo config failed to load:", failedConfigs);
  }

  return {
    loadedConfigs,
    failedConfigs,
  };
}
