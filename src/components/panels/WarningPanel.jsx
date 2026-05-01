import { useMemo } from "react";
import { getRecommendedMeasures } from "../../services/measureService";
import { useSceneStore } from "../../store/sceneStore";
import { useWarningStore } from "../../store/warningStore";
import { formatDistance, formatRiskType } from "../../utils/formatters";

const LEVEL_ORDER = ["critical", "high", "medium", "low"];

export default function WarningPanel({
  workingFaces = [],
  riskBodies = [],
  advanceDistance = 0,
}) {
  const warnings = useWarningStore((state) => state.warnings);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const stats = useMemo(() => {
    return warnings.reduce((result, warning) => {
      result[warning.level] = (result[warning.level] || 0) + 1;
      return result;
    }, {});
  }, [warnings]);

  function handleSelectWarning(warning) {
    const riskBody = riskBodies.find((item) => item.id === warning.riskBodyId);
    const workingFace = workingFaces.find(
      (item) => item.id === warning.workingFaceId
    );

    setSelectedObject(
      riskBody || {
        ...workingFace,
        currentAdvance: advanceDistance,
      }
    );
  }

  return (
    <section className="fixed bottom-6 right-5 z-20 max-h-[46vh] w-[360px] overflow-hidden border border-white/10 bg-slate-950/86 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-cyan-100">风险预警</div>
          <div className="text-2xl font-semibold">{warnings.length}</div>
        </div>
        <div className="mt-2 flex gap-2 text-[11px]">
          {LEVEL_ORDER.map((level) => (
            <div
              key={level}
              className="border border-white/10 px-2 py-1 text-slate-300"
            >
              {level}: {stats[level] || 0}
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-[calc(46vh-86px)] overflow-auto">
        {warnings.length === 0 && (
          <div className="p-4 text-sm text-slate-400">当前推进位置无预警。</div>
        )}

        {warnings.map((warning) => {
          const measures = getRecommendedMeasures(warning);

          return (
            <button
              key={warning.id}
              className="block w-full cursor-pointer border-b border-white/[0.06] p-4 text-left transition hover:bg-white/[0.04]"
              onClick={() => handleSelectWarning(warning)}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-100">
                  {warning.workingFaceName}
                </span>
                <span
                  className="shrink-0 text-xs font-semibold"
                  style={{ color: warning.color }}
                >
                  {warning.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] leading-5 text-slate-400">
                <span>风险体</span>
                <span className="text-right text-slate-200">{warning.riskBodyName}</span>
                <span>风险类型</span>
                <span className="text-right text-slate-200">
                  {formatRiskType(warning.riskType)}
                </span>
                <span>距离</span>
                <span className="text-right text-slate-200">
                  {formatDistance(warning.distance)}
                </span>
              </div>

              <div className="mt-2 text-[12px] leading-5 text-slate-300">
                {warning.reason}
              </div>
              <div className="mt-1 text-[12px] leading-5 text-cyan-100">
                {warning.suggestion}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                建议措施：{measures.map((item) => item.name).join("、")}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
