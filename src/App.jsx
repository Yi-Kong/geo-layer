import { useEffect, useMemo, useState } from "react";
import GeoScene from "./components/geo3d/GeoScene";
import AdvanceSlider from "./components/mining/AdvanceSlider";
import InfoPanel from "./components/panels/InfoPanel";
import LayerPanel from "./components/panels/LayerPanel";
import WarningPanel from "./components/panels/WarningPanel";
import { useLayerControl } from "./hooks/useLayerControl";
import {
  getCoalSeams,
  getGasRichAreas,
  getGoafWaterAreas,
  getMineInfo,
  getRiskBodies,
  getStrata,
  getWaterRichAreas,
  getWorkingFaces,
} from "./services/mockDataService";
import { generateWarningsByAdvance } from "./services/warningService";
import { useSceneStore } from "./store/sceneStore";
import { useWarningStore } from "./store/warningStore";

export default function App() {
  const {
    layerData,
    visibleLayerIds,
    selectedLayerId,
    explode,
    loading,
    setExplode,
    setSelectedLayerId,
  } = useLayerControl();
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const setWarnings = useWarningStore((state) => state.setWarnings);
  const warnings = useWarningStore((state) => state.warnings);
  const mineInfo = useMemo(() => getMineInfo(), []);
  const strata = useMemo(() => getStrata(), []);
  const coalSeams = useMemo(() => getCoalSeams(), []);
  const workingFaces = useMemo(() => getWorkingFaces(), []);
  const goafWaterAreas = useMemo(() => getGoafWaterAreas(), []);
  const waterRichAreas = useMemo(() => getWaterRichAreas(), []);
  const gasRichAreas = useMemo(() => getGasRichAreas(), []);
  const riskBodies = useMemo(() => getRiskBodies(), []);
  const [advanceDistance, setAdvanceDistance] = useState(
    workingFaces[0]?.currentAdvance || 0
  );

  useEffect(() => {
    setWarnings(
      generateWarningsByAdvance(workingFaces, riskBodies, advanceDistance)
    );
  }, [advanceDistance, riskBodies, setWarnings, workingFaces]);

  function handleSelectLegacyLayer(layerId) {
    setSelectedLayerId(layerId);

    const layer = layerData.find((item) => item.id === layerId);

    if (layer) {
      setSelectedObject({
        ...layer,
        type: "legacy_stratum",
        code: `LEGACY-${layer.id}`,
        properties: {
          lithology: layer.lithology,
          age: layer.age,
          porosity: layer.porosity,
          permeability: layer.permeability,
          description: layer.description,
        },
      });
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <GeoScene
        layerData={layerData}
        visibleLayerIds={visibleLayerIds}
        explode={explode}
        selectedLayerId={selectedLayerId}
        onSelectLayer={handleSelectLegacyLayer}
        strata={strata}
        coalSeams={coalSeams}
        workingFaces={workingFaces}
        goafWaterAreas={goafWaterAreas}
        waterRichAreas={waterRichAreas}
        gasRichAreas={gasRichAreas}
        warnings={warnings}
        advanceDistance={advanceDistance}
      />

      <div className="pointer-events-none fixed left-1/2 top-5 z-20 hidden -translate-x-1/2 border border-white/10 bg-slate-950/70 px-4 py-2 text-center text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.26)] backdrop-blur-md lg:block">
        <div className="text-sm font-semibold text-cyan-100">
          基于模拟数据的煤矿透明地质三维可视化与风险预警系统
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          {mineInfo.location} / {mineInfo.coordinateSystem}
        </div>
      </div>

      <LayerPanel
        mineInfo={mineInfo}
        explode={explode}
        onExplodeChange={setExplode}
        legacyLoading={loading}
      />
      <InfoPanel coalSeams={coalSeams} />
      <WarningPanel
        workingFaces={workingFaces}
        riskBodies={riskBodies}
        advanceDistance={advanceDistance}
      />
      <AdvanceSlider
        workingFace={workingFaces[0]}
        advanceDistance={advanceDistance}
        onAdvanceChange={setAdvanceDistance}
      />
    </div>
  );
}
