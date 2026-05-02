import { useMemo, useState } from "react";
import { getRecommendedMeasures } from "../../services/measureService";
import {
  buildWorkingFaceRiskSummary,
  getRiskTypeLabel,
} from "../../services/warningService";
import { useSceneStore } from "../../store/sceneStore";
import { useWarningStore } from "../../store/warningStore";
import { moveBoundary } from "../../utils/distance";
import { formatDistance } from "../../utils/formatters";

const LEVEL_ORDER = ["critical", "high", "medium", "low"];

function getDefaultWorkingFace(workingFaces, selectedWorkingFaceId) {
  if (!Array.isArray(workingFaces) || workingFaces.length === 0) {
    return null;
  }

  return (
    workingFaces.find((face) => face.id === selectedWorkingFaceId) ||
    workingFaces.find(
      (face) => face.stage === "active" || face.status === "mining"
    ) ||
    workingFaces[0]
  );
}

function buildAdvancedWorkingFace(workingFace, advanceDistance) {
  if (!workingFace) {
    return null;
  }

  const safeAdvanceDistance = Number(advanceDistance) || 0;
  const canMove =
    Array.isArray(workingFace.boundary) &&
    Array.isArray(workingFace.advanceDirection);

  return {
    ...workingFace,
    boundary: canMove
      ? moveBoundary(
          workingFace.boundary,
          workingFace.advanceDirection,
          safeAdvanceDistance
        )
      : workingFace.boundary,
    currentAdvance: safeAdvanceDistance,
  };
}

function getLevelStats(warnings) {
  return warnings.reduce((result, warning) => {
    result[warning.level] = (result[warning.level] || 0) + 1;
    return result;
  }, {});
}

function getRiskItemLevel(risk) {
  return risk.matchedLevel || {
    level: "none",
    label: "无预警",
    color: "#22c55e",
  };
}

export default function WarningPanel({
  workingFaces = [],
  riskBodies = [],
  advanceDistance = 0,
  selectedWorkingFaceId,
  selectedRiskBodyId,
  onSelectWarning,
  onSelectRiskBody,
}) {
  const warnings = useWarningStore((state) => state.warnings);
  const setSelectedObject = useSceneStore((state) => state.setSelectedObject);
  const [localSelectedRiskBodyId, setLocalSelectedRiskBodyId] = useState(null);
  const currentWorkingFace = useMemo(
    () => getDefaultWorkingFace(workingFaces, selectedWorkingFaceId),
    [selectedWorkingFaceId, workingFaces]
  );
  const advancedWorkingFace = useMemo(
    () => buildAdvancedWorkingFace(currentWorkingFace, advanceDistance),
    [advanceDistance, currentWorkingFace]
  );
  const summary = useMemo(
    () => buildWorkingFaceRiskSummary(advancedWorkingFace, riskBodies),
    [advancedWorkingFace, riskBodies]
  );
  const currentWarnings = useMemo(() => {
    if (!advancedWorkingFace?.id) {
      return warnings;
    }

    return warnings.filter(
      (warning) => warning.workingFaceId === advancedWorkingFace.id
    );
  }, [advancedWorkingFace, warnings]);
  const stats = useMemo(() => getLevelStats(currentWarnings), [currentWarnings]);
  const activeSelectedRiskBodyId =
    selectedRiskBodyId || localSelectedRiskBodyId;
  const hasRiskSummary = Boolean(advancedWorkingFace && riskBodies.length > 0);

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
    setLocalSelectedRiskBodyId(warning.riskBodyId || null);
    onSelectRiskBody?.(warning.riskBodyId, warning);
    onSelectWarning?.(warning);
  }

  function handleSelectRisk(risk) {
    const matchedWarning = currentWarnings.find(
      (warning) => warning.riskBodyId === risk.riskBodyId
    );
    const warningPayload =
      matchedWarning || {
        id: `${summary.workingFaceId || "working-face"}-${risk.riskBodyId}`,
        workingFaceId: summary.workingFaceId,
        workingFaceName: summary.workingFaceName,
        riskBodyId: risk.riskBodyId,
        riskBodyName: risk.riskBodyName,
        riskType: risk.riskType,
        distance: risk.distance,
        level: risk.matchedLevel?.level || "none",
        label: risk.matchedLevel?.label || "无预警",
        color: risk.matchedLevel?.color || "#22c55e",
        reason: risk.reason,
        suggestion: risk.suggestion,
        status: "active",
      };

    setLocalSelectedRiskBodyId(risk.riskBodyId);

    if (risk.riskBody) {
      setSelectedObject(risk.riskBody);
    }

    onSelectRiskBody?.(risk.riskBodyId, risk);
    onSelectWarning?.(warningPayload);
  }

  if (!hasRiskSummary) {
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
            <div className="p-4 text-sm text-slate-400">
              当前推进位置无预警。
            </div>
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
                  <span className="text-right text-slate-200">
                    {warning.riskBodyName}
                  </span>
                  <span>风险类型</span>
                  <span className="text-right text-slate-200">
                    {getRiskTypeLabel(warning.riskType)}
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

  return (
    <section className="fixed bottom-6 right-5 z-20 max-h-[58vh] w-[390px] overflow-hidden border border-white/10 bg-slate-950/88 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-cyan-100">预警分析</div>
            <div className="mt-1 truncate text-[12px] text-slate-300">
              当前工作面：{summary.workingFaceName}
            </div>
          </div>
          <div
            className="shrink-0 text-right text-sm font-semibold"
            style={{ color: summary.highestColor }}
          >
            {summary.highestLabel}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">当前预警</div>
            <div className="mt-1 font-semibold text-slate-100">
              {summary.warningCount} 条
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">最近距离</div>
            <div className="mt-1 font-semibold text-slate-100">
              {formatDistance(summary.nearestDistance)}
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">主要风险</div>
            <div className="mt-1 truncate font-semibold text-slate-100">
              {summary.mainRiskTypes.join("、") || "当前无明显风险"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(58vh-126px)] overflow-auto">
        {summary.warningCount === 0 && (
          <div className="border-b border-white/[0.06] px-4 py-3 text-sm text-slate-400">
            当前无明显风险，最近风险体仍可点击查看空间关系。
          </div>
        )}

        <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-semibold text-slate-400">
          最近风险体 Top 3
        </div>

        {summary.nearestRisks.length === 0 && (
          <div className="p-4 text-sm text-slate-400">暂无预警。</div>
        )}

        {summary.nearestRisks.map((risk, index) => {
          const level = getRiskItemLevel(risk);
          const selected = activeSelectedRiskBodyId === risk.riskBodyId;

          return (
            <button
              key={risk.riskBodyId}
              className={`block w-full cursor-pointer border-b p-4 text-left transition ${
                selected
                  ? "border-cyan-300/30 bg-cyan-300/10"
                  : "border-white/[0.06] hover:bg-white/[0.04]"
              }`}
              onClick={() => handleSelectRisk(risk)}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="mr-2 text-xs text-slate-500">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {risk.riskBodyName}
                  </span>
                </div>
                <span
                  className="shrink-0 text-xs font-semibold"
                  style={{ color: level.color }}
                >
                  {formatDistance(risk.distance)}
                </span>
              </div>

              <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="border border-white/10 px-2 py-1 text-slate-300">
                  {risk.riskTypeLabel || getRiskTypeLabel(risk.riskType)}
                </span>
                <span
                  className="border px-2 py-1 font-semibold"
                  style={{ borderColor: `${level.color}80`, color: level.color }}
                >
                  {level.label}
                </span>
              </div>

              <div className="text-[12px] leading-5 text-slate-300">
                原因：{risk.reason}
              </div>
              <div className="mt-1 text-[12px] leading-5 text-cyan-100">
                建议：{risk.suggestion}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
