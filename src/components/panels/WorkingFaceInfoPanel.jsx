import {
  buildWorkingFaceRiskSummary,
  getNearestRiskBodies,
  getRiskTypeLabel,
} from "../../services/warningService";
import { moveBoundary } from "../../utils/distance";

const DEFAULT_SUGGESTION =
  "建议持续跟踪工作面推进情况，结合钻探、物探和现场揭露资料复核风险。";

const RISK_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#facc15",
  low: "#22c55e",
  none: "#22c55e",
  default: "#22d3ee",
};

function safeText(value, fallback = "--") {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => safeText(item, ""))
      .filter(Boolean)
      .join("、");

    return text || fallback;
  }

  const text = String(value).trim();
  return text || fallback;
}

function toFiniteNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);

    if (!match) {
      return fallback;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function getStageLabel(face = {}) {
  if (face.stageLabel) {
    return face.stageLabel;
  }

  switch (face.status || face.stage) {
    case "mining":
    case "active":
      return "正在回采";
    case "planned":
      return "计划准备";
    case "paused":
      return "暂停推进";
    case "completed":
      return "已完成";
    default:
      return "状态未知";
  }
}

function getRiskLabel(level) {
  switch (level) {
    case "critical":
      return "严重风险";
    case "high":
      return "高风险";
    case "medium":
      return "中风险";
    case "low":
      return "低风险";
    case "none":
      return "无明显风险";
    default:
      return "未评级";
  }
}

function getRiskColor(level) {
  return RISK_COLORS[level] || RISK_COLORS.default;
}

function getAdvancePercent(current, planned) {
  if (!planned || planned <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / planned) * 100)));
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1).replace(/\.0$/, "");
}

function formatDistance(distance) {
  const value = toFiniteNumber(distance, NaN);

  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} m`;
}

function formatMeter(value) {
  if (!hasValue(value)) {
    return "--";
  }

  if (typeof value === "string" && /[a-zA-Z\u4e00-\u9fa5]/.test(value)) {
    return safeText(value);
  }

  const number = toFiniteNumber(value, NaN);

  if (!Number.isFinite(number)) {
    return safeText(value);
  }

  return `${formatNumber(number)} m`;
}

function formatPeriod(face = {}) {
  if (face.startDate || face.endDate) {
    return `${safeText(face.startDate)} 至 ${safeText(face.endDate)}`;
  }

  return safeText(face.properties?.计划周期);
}

function formatAdvanceDirection(direction) {
  if (!Array.isArray(direction) || direction.length < 3) {
    return safeText(direction);
  }

  const values = direction.map((item) => toFiniteNumber(item, 0));
  const axisIndex = values.reduce(
    (maxIndex, value, index) =>
      Math.abs(value) > Math.abs(values[maxIndex]) ? index : maxIndex,
    0
  );
  const axisLabels = ["X", "Y", "Z"];
  const sign = values[axisIndex] >= 0 ? "+" : "-";

  return `${axisLabels[axisIndex]}${sign}方向`;
}

function getCurrentAdvance(face = {}, advanceDistance) {
  const distance = toFiniteNumber(advanceDistance, NaN);

  if (Number.isFinite(distance)) {
    return Math.max(0, distance);
  }

  return Math.max(
    0,
    toFiniteNumber(face.currentAdvance ?? face.metrics?.currentAdvance, 0)
  );
}

function getPlannedAdvance(face = {}) {
  return toFiniteNumber(
    face.plannedAdvance ??
      face.metrics?.plannedAdvance ??
      face.properties?.计划推进 ??
      face.metrics?.faceLength,
    0
  );
}

function getFaceLength(face = {}) {
  return (
    face.metrics?.faceLength ??
    face.properties?.面长 ??
    face.properties?.工作面长度 ??
    face.size?.[0]
  );
}

function getFaceWidth(face = {}) {
  return (
    face.metrics?.faceWidth ??
    face.properties?.面宽 ??
    face.properties?.工作面宽度 ??
    face.size?.[2]
  );
}

function getMonthlyAdvance(face = {}) {
  return face.monthlyAdvance ?? face.metrics?.monthlyAdvance ?? face.properties?.月推进;
}

function buildAdvancedWorkingFace(face, currentAdvance) {
  if (!face) {
    return null;
  }

  const canMove =
    Array.isArray(face.boundary) && Array.isArray(face.advanceDirection);

  return {
    ...face,
    boundary: canMove
      ? moveBoundary(face.boundary, face.advanceDirection, currentAdvance)
      : face.boundary,
    currentAdvance,
  };
}

function getMainRiskText(face = {}, generatedSummary = {}) {
  const mainRisks = face.riskSummary?.mainRisks;

  if (Array.isArray(mainRisks) && mainRisks.length > 0) {
    return mainRisks.filter(Boolean).join("、");
  }

  if (typeof mainRisks === "string" && mainRisks.trim()) {
    return mainRisks;
  }

  if (Array.isArray(generatedSummary.mainRiskTypes)) {
    const text = generatedSummary.mainRiskTypes.filter(Boolean).join("、");

    if (text) {
      return text;
    }
  }

  return safeText(face.properties?.当前风险);
}

function normalizeIds(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,，、\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getRelatedTunnels(face = {}, tunnels = []) {
  const ids = normalizeIds(face.relatedTunnelIds);

  if (ids.length === 0 || !Array.isArray(tunnels)) {
    return [];
  }

  return ids
    .map((id) => tunnels.find((tunnel) => tunnel?.id === id || tunnel?.code === id))
    .filter(Boolean);
}

function getWorkingFaceWarnings(face = {}, warnings = []) {
  if (!face?.id || !Array.isArray(warnings)) {
    return [];
  }

  return warnings.filter((warning) => warning?.workingFaceId === face.id);
}

function getRiskBodyId(risk) {
  return risk?.riskBodyId || risk?.riskBody?.id || risk?.id || "";
}

function getRiskBodyName(risk) {
  return safeText(risk?.riskBodyName || risk?.riskBody?.name || risk?.name);
}

function getRiskBodyLevel(risk) {
  return (
    risk?.riskBody?.riskLevel ||
    risk?.riskLevel ||
    risk?.matchedLevel?.level ||
    "default"
  );
}

function getRiskBodySuggestion(risk) {
  const riskBody = risk?.riskBody || risk;

  return (
    riskBody?.properties?.建议措施 ||
    riskBody?.properties?.处置建议 ||
    risk?.suggestion ||
    riskBody?.properties?.主要风险 ||
    ""
  );
}

function getNearestRiskItems(face, riskBodies = [], limit = 3) {
  if (!face || !Array.isArray(riskBodies) || riskBodies.length === 0) {
    return [];
  }

  const nearestRisks = getNearestRiskBodies(face, riskBodies, limit);

  if (nearestRisks.length > 0) {
    return nearestRisks;
  }

  return riskBodies.slice(0, limit).map((riskBody, index) => ({
    riskBody,
    riskBodyId: riskBody.id || riskBody.code || `risk-body-${index}`,
    riskBodyName: safeText(riskBody.name || riskBody.code || riskBody.id),
    riskType: riskBody.riskType || riskBody.type,
    riskTypeLabel: getRiskTypeLabel(riskBody.riskType || riskBody.type),
    riskLevel: riskBody.riskLevel,
    distance: null,
    suggestion:
      riskBody.properties?.建议措施 ||
      riskBody.properties?.处置建议 ||
      riskBody.properties?.主要风险 ||
      "",
  }));
}

function getTreatmentSuggestions(face = {}, warnings = [], nearestRisks = []) {
  const suggestions = [
    ...warnings.map((warning) => warning?.suggestion),
    face.riskSummary?.suggestion,
    ...nearestRisks.map((risk) => getRiskBodySuggestion(risk)),
    DEFAULT_SUGGESTION,
  ];
  const unique = [];

  suggestions.forEach((item) => {
    const text = safeText(item, "");

    if (text && !unique.includes(text)) {
      unique.push(text);
    }
  });

  return unique.slice(0, 3);
}

function InfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12px] leading-5">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={`min-w-0 text-right text-slate-200 ${valueClassName}`}>
        {safeText(value)}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t border-white/10 px-4 py-3">
      <div className="mb-2 text-[12px] font-semibold text-cyan-100">{title}</div>
      {children}
    </div>
  );
}

export default function WorkingFaceInfoPanel({
  workingFace = null,
  workingFaces = [],
  tunnels = [],
  riskBodies = [],
  warnings = [],
  advanceDistance = 0,
  selectedWorkingFaceId = "",
  onSelectWorkingFace,
  onSelectRiskBody,
}) {
  const hasWorkingFace = Boolean(workingFace);
  const currentAdvance = getCurrentAdvance(workingFace || {}, advanceDistance);
  const plannedAdvance = getPlannedAdvance(workingFace || {});
  const advancePercent = getAdvancePercent(currentAdvance, plannedAdvance);
  const remainingAdvance = Math.max(0, plannedAdvance - currentAdvance);
  const riskLevel =
    workingFace?.riskSummary?.highestLevel || workingFace?.riskLevel || "default";
  const riskColor = getRiskColor(riskLevel);
  const advancedWorkingFace = buildAdvancedWorkingFace(workingFace, currentAdvance);
  const generatedSummary = buildWorkingFaceRiskSummary(
    advancedWorkingFace,
    riskBodies
  );
  const relatedTunnels = getRelatedTunnels(workingFace || {}, tunnels);
  const workingFaceWarnings = getWorkingFaceWarnings(workingFace || {}, warnings);
  const nearestRisks = getNearestRiskItems(advancedWorkingFace, riskBodies, 3);
  const suggestions = getTreatmentSuggestions(
    workingFace || {},
    workingFaceWarnings,
    nearestRisks
  );
  const summaryNearestRiskId =
    workingFace?.riskSummary?.nearestRiskBodyId || getRiskBodyId(nearestRisks[0]);
  const nearestRisk =
    riskBodies.find((riskBody) => riskBody?.id === summaryNearestRiskId) ||
    nearestRisks[0]?.riskBody;
  const nearestDistance =
    Number.isFinite(toFiniteNumber(nearestRisks[0]?.distance, NaN))
      ? nearestRisks[0]?.distance
      : workingFace?.riskSummary?.nearestRiskDistance;
  const warningCount = Array.isArray(warnings)
    ? workingFaceWarnings.length
    : workingFace?.riskSummary?.warningCount || generatedSummary.warningCount || 0;

  return (
    <section className="fixed right-5 top-[84px] z-20 flex max-h-[43vh] min-h-[280px] w-[390px] flex-col overflow-hidden border border-cyan-300/20 bg-slate-950/88 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.36)] backdrop-blur-md max-lg:right-4 max-lg:top-[76px] max-lg:max-h-[calc(100vh-220px)] max-lg:w-[min(390px,calc(100vw-32px))]">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-cyan-100">工作面详情</div>
            <div className="mt-1 truncate text-base font-semibold">
              {hasWorkingFace ? safeText(workingFace.name) : "暂无工作面详情"}
            </div>
            {hasWorkingFace && (
              <div className="mt-1 text-[12px]" style={{ color: riskColor }}>
                {getStageLabel(workingFace)} / {getRiskLabel(riskLevel)}
              </div>
            )}
          </div>

          {workingFaces.length > 1 && onSelectWorkingFace && (
            <select
              aria-label="工作面详情选择"
              className="min-w-[124px] shrink-0 cursor-pointer border border-cyan-300/20 bg-slate-900/90 px-2 py-1 text-[12px] text-slate-100 outline-none transition focus:border-cyan-300"
              value={workingFace?.id || selectedWorkingFaceId || ""}
              onChange={(event) => onSelectWorkingFace?.(event.target.value)}
            >
              {workingFaces.map((face) => (
                <option key={face.id} value={face.id}>
                  {face.name || face.code || face.id}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!hasWorkingFace ? (
        <div className="p-4 text-sm text-slate-400">暂无工作面详情</div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <Section title="基础信息">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-sm:grid-cols-1">
              <InfoRow label="工作面编号" value={workingFace.code || workingFace.id} />
              <InfoRow label="工作面名称" value={workingFace.name} />
              <InfoRow
                label="所属煤层"
                value={workingFace.properties?.煤层 || workingFace.coalSeamId}
              />
              <InfoRow label="工作面状态" value={getStageLabel(workingFace)} />
              <InfoRow label="计划周期" value={formatPeriod(workingFace)} />
              <InfoRow label="面长" value={formatMeter(getFaceLength(workingFace))} />
              <InfoRow label="面宽" value={formatMeter(getFaceWidth(workingFace))} />
            </div>
          </Section>

          <Section title="采掘进度">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-100">
                {formatMeter(currentAdvance)} / {formatMeter(plannedAdvance)}
              </span>
              <span className="font-semibold text-cyan-100">
                {advancePercent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden bg-slate-800/90">
              <div
                className="h-full transition-all"
                style={{
                  width: `${advancePercent}%`,
                  backgroundColor: riskColor,
                }}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 max-sm:grid-cols-1">
              <InfoRow label="剩余推进" value={formatMeter(remainingAdvance)} />
              <InfoRow
                label="月推进"
                value={formatMeter(getMonthlyAdvance(workingFace))}
              />
              <InfoRow
                label="推进方向"
                value={formatAdvanceDirection(workingFace.advanceDirection)}
              />
            </div>
          </Section>

          <Section title="关联巷道">
            {relatedTunnels.length === 0 ? (
              <div className="text-sm text-slate-400">暂无关联巷道</div>
            ) : (
              <div className="space-y-2">
                {relatedTunnels.map((tunnel) => {
                  const tunnelRiskColor = getRiskColor(tunnel.riskLevel);

                  return (
                    <div
                      key={tunnel.id || tunnel.code}
                      className="border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-100">
                          {safeText(tunnel.name)}
                        </span>
                        <span
                          className="shrink-0 text-[11px] font-semibold"
                          style={{ color: tunnelRiskColor }}
                        >
                          {getRiskLabel(tunnel.riskLevel)}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-400">
                        {safeText(tunnel.properties?.巷道类型 || tunnel.type)} /{" "}
                        {formatMeter(tunnel.properties?.长度 || tunnel.size?.[0])}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="风险摘要">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-sm:grid-cols-1">
              <InfoRow
                label="最高风险等级"
                value={getRiskLabel(riskLevel)}
                valueClassName="font-semibold"
              />
              <InfoRow label="主要风险" value={getMainRiskText(workingFace, generatedSummary)} />
              <InfoRow label="最近风险体" value={nearestRisk?.name} />
              <InfoRow label="最近距离" value={formatDistance(nearestDistance)} />
              <InfoRow label="预警数量" value={`${warningCount} 条`} />
            </div>
          </Section>

          <Section title="最近风险体 Top 3">
            {nearestRisks.length === 0 ? (
              <div className="text-sm text-slate-400">暂无附近风险体</div>
            ) : (
              <div className="space-y-2">
                {nearestRisks.map((risk, index) => {
                  const itemLevel = getRiskBodyLevel(risk);
                  const itemColor = getRiskColor(itemLevel);
                  const riskBodyId = getRiskBodyId(risk);
                  const riskBody = risk.riskBody || risk;

                  return (
                    <button
                      key={riskBodyId || index}
                      className="block w-full cursor-pointer border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/10"
                      type="button"
                      onClick={() => riskBodyId && onSelectRiskBody?.(riskBodyId)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-100">
                            {index + 1}. {getRiskBodyName(risk)}
                          </div>
                          <div className="mt-1 text-[12px] text-slate-400">
                            {safeText(
                              risk.riskTypeLabel ||
                                getRiskTypeLabel(risk.riskType || riskBody.type)
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-[12px]">
                          <div className="font-semibold" style={{ color: itemColor }}>
                            {formatDistance(risk.distance)}
                          </div>
                          <div className="mt-1" style={{ color: itemColor }}>
                            {getRiskLabel(itemLevel)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-[12px] leading-5 text-cyan-100">
                        {safeText(getRiskBodySuggestion(risk), "暂无建议措施")}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="当前预警">
            {workingFaceWarnings.length === 0 ? (
              <div className="text-sm text-slate-400">当前暂无预警</div>
            ) : (
              <div className="space-y-2">
                {workingFaceWarnings.map((warning) => {
                  const warningColor = warning.color || getRiskColor(warning.level);

                  return (
                    <div
                      key={warning.id}
                      className="border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: warningColor }}
                        >
                          {safeText(warning.label || getRiskLabel(warning.level))}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {safeText(warning.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] leading-5">
                        <span className="text-slate-500">风险体</span>
                        <span className="text-right text-slate-200">
                          {safeText(warning.riskBodyName)}
                        </span>
                        <span className="text-slate-500">距离</span>
                        <span className="text-right text-slate-200">
                          {formatDistance(warning.distance)}
                        </span>
                      </div>
                      <div className="mt-2 text-[12px] leading-5 text-slate-300">
                        {safeText(warning.reason)}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-cyan-100">
                        {safeText(warning.suggestion)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="治理建议">
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion}-${index}`}
                  className="border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[12px] leading-5 text-cyan-50"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </section>
  );
}
