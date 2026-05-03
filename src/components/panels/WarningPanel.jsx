import { useMemo, useState } from "react";
import { getRecommendedMeasures } from "../../services/measureService";
import {
  buildWorkingFaceRiskSummary,
  getRiskTypeLabel as getServiceRiskTypeLabel,
} from "../../services/warningService";
import { useSceneStore } from "../../store/sceneStore";
import { useWarningStore } from "../../store/warningStore";
import { moveBoundary } from "../../utils/distance";
import { formatDistance } from "../../utils/formatters";

const FILE_SECTION_GROUPS = [
  {
    id: "7.5",
    name: "小窑破坏区",
    description:
      "采空区、老空水、小窑破坏区、废弃井筒、封闭不良钻孔等隐蔽致灾因素。",
    riskTypes: [
      "goaf_water",
      "small_mine_damage",
      "goaf",
      "abandoned_shaft",
      "poor_sealed_borehole",
    ],
  },
  {
    id: "7.6",
    name: "奥灰带压矿井突水危险区",
    description: "富水区、含水层、突水点、导水构造、断层影响带等水害风险。",
    riskTypes: ["water_inrush", "fault_influence"],
  },
  {
    id: "7.7",
    name: "瓦斯富集区和软分层分布区",
    description: "瓦斯富集区、瓦斯含量压力异常区、软分层及相关构造风险。",
    riskTypes: ["gas", "soft_layer", "fault_influence"],
  },
];

const SECTION_FILTERS = [
  { id: "all", label: "全部" },
  { id: "7.5", label: "7.5 小窑破坏区" },
  { id: "7.6", label: "7.6 突水危险区" },
  { id: "7.7", label: "7.7 瓦斯富集区" },
];

const FILE_SECTION_LABELS = {
  "7.5": "小窑破坏区",
  "7.6": "奥灰带压矿井突水危险区",
  "7.7": "瓦斯富集区和软分层分布区",
  "7.5/7.6": "小窑破坏区 / 奥灰带压矿井突水危险区",
  "7.6/7.7": "奥灰带压矿井突水危险区 / 瓦斯富集区和软分层分布区",
};

const RISK_TYPE_LABELS = {
  goaf_water: "采空积水区 / 老空水",
  water_inrush: "富水区 / 突水危险区",
  gas: "瓦斯富集区",
  soft_layer: "软分层",
  small_mine_damage: "小窑破坏区",
  goaf: "采空区",
  abandoned_shaft: "废弃井筒",
  poor_sealed_borehole: "封闭不良钻孔",
  fault_influence: "断层影响带",
  goaf_water_area: "采空积水区 / 老空水",
  water_rich_area: "富水区 / 突水危险区",
  water_inrush_point: "富水区 / 突水危险区",
  gas_rich_area: "瓦斯富集区",
  small_mine_damage_area: "小窑破坏区",
  goaf_area: "采空区",
  fault_influence_zone: "断层影响带",
};

const RISK_TYPE_ORDER = [
  "goaf_water",
  "water_inrush",
  "gas",
  "soft_layer",
  "small_mine_damage",
  "goaf",
  "abandoned_shaft",
  "poor_sealed_borehole",
  "fault_influence",
];

const RISK_LEVEL_COLORS = {
  low: "#2A9D8F",
  medium: "#E9C46A",
  high: "#F4A261",
  critical: "#E63946",
  none: "#94A3B8",
};

const RISK_LEVEL_LABELS = {
  low: "低风险",
  medium: "一般",
  high: "较大",
  critical: "严重",
  none: "无预警",
};

const RISK_LEVEL_RANK = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const FALLBACK_SUGGESTIONS = {
  goaf_water: "建议开展超前探放水，并核查老空积水边界。",
  water_inrush: "建议开展突水危险性复核，必要时进行注浆加固或疏水降压。",
  gas: "建议加强瓦斯含量和压力复测，布置区域预抽钻孔。",
  soft_layer: "建议加强软分层探查，优化抽采钻孔布置。",
  small_mine_damage: "建议核查小窑破坏区边界，开展超前物探和钻探验证。",
  goaf: "建议核查采空区边界及积水情况。",
  abandoned_shaft: "建议复核废弃井筒封闭情况，必要时注浆封堵。",
  poor_sealed_borehole: "建议复核钻孔封闭质量，必要时重新封孔。",
  fault_influence: "建议复核断层位置，开展超前探测并评估导水或瓦斯富集风险。",
};

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

function normalizeRiskType(riskType, legacyType) {
  switch (riskType || legacyType) {
    case "goaf_water_area":
    case "goaf_water":
      return "goaf_water";
    case "goaf_area":
    case "goaf":
      return "goaf";
    case "water_rich_area":
    case "water_inrush_point":
    case "water_inrush":
      return "water_inrush";
    case "gas_rich_area":
    case "gas_rich":
    case "gas":
      return "gas";
    case "small_mine_damage_area":
    case "small_mine_damage":
      return "small_mine_damage";
    case "fault":
    case "fault_influence_zone":
    case "fault_influence":
      return "fault_influence";
    case "abandoned_shaft":
      return "abandoned_shaft";
    case "poor_sealed_borehole":
      return "poor_sealed_borehole";
    case "soft_layer":
      return "soft_layer";
    default:
      return riskType || legacyType || "unknown";
  }
}

function safeText(value, fallback = "--") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const text = value.map((item) => safeText(item, "")).filter(Boolean).join("、");
    return text || fallback;
  }

  if (typeof value === "object") {
    return (
      safeText(
        value.name ||
          value.label ||
          value.title ||
          value.description ||
          value.suggestion,
        ""
      ) || fallback
    );
  }

  return String(value);
}

function firstText(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstText(item);

      if (text) {
        return text;
      }
    }

    return "";
  }

  const text = safeText(value, "");
  return text === "--" ? "" : text;
}

function toFiniteNumber(value, fallback = NaN) {
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

function formatDistanceSafe(value) {
  const distance = toFiniteNumber(value);
  return Number.isFinite(distance) ? formatDistance(distance) : "--";
}

function getRiskBodyById(riskBodies, riskBodyId) {
  if (!riskBodyId || !Array.isArray(riskBodies)) {
    return null;
  }

  return riskBodies.find((item) => item.id === riskBodyId) || null;
}

function getRiskType(item, riskBody) {
  return normalizeRiskType(
    item?.riskType || item?.normalizedRiskType,
    riskBody?.riskType || riskBody?.type
  );
}

function getRiskTypeLabelSafe(riskType, fallback) {
  const normalizedRiskType = normalizeRiskType(riskType);
  const serviceLabel = getServiceRiskTypeLabel(normalizedRiskType);
  const genericServiceLabel = serviceLabel === "综合风险" ? "" : serviceLabel;

  return safeText(
    genericServiceLabel ||
      RISK_TYPE_LABELS[normalizedRiskType] ||
      RISK_TYPE_LABELS[riskType] ||
      fallback ||
      serviceLabel,
    "综合风险"
  );
}

function getWarningLevel(warning, risk, riskBody) {
  const matchedLevel = warning?.matchedLevel || risk?.matchedLevel;
  const rawLevel =
    warning?.level ||
    warning?.riskLevel ||
    matchedLevel?.level ||
    risk?.level ||
    risk?.riskLevel ||
    riskBody?.riskLevel ||
    "none";
  const level = RISK_LEVEL_RANK[rawLevel] !== undefined ? rawLevel : "none";
  const label = safeText(
    warning?.label ||
      warning?.riskLevelLabel ||
      matchedLevel?.label ||
      risk?.label ||
      risk?.riskLevelLabel ||
      riskBody?.riskLevelLabel ||
      RISK_LEVEL_LABELS[level],
    RISK_LEVEL_LABELS[level]
  );

  return { level, label };
}

function getRiskLevelColor(item, riskBody, level) {
  return item?.color || riskBody?.color || RISK_LEVEL_COLORS[level] || "#94A3B8";
}

function getExplicitFileSection(riskBody, item) {
  return riskBody?.fileSection || item?.fileSection || "";
}

function splitFileSectionIds(fileSection) {
  const text = safeText(fileSection, "");

  if (!text) {
    return [];
  }

  return FILE_SECTION_GROUPS.filter((group) => text.includes(group.id)).map(
    (group) => group.id
  );
}

function getFileSectionIds(riskBody, item) {
  const explicitSectionIds = splitFileSectionIds(
    getExplicitFileSection(riskBody, item)
  );

  if (explicitSectionIds.length > 0) {
    return explicitSectionIds;
  }

  const riskType = getRiskType(item, riskBody);
  const matchedGroups = FILE_SECTION_GROUPS.filter((group) =>
    group.riskTypes.includes(riskType)
  );

  return matchedGroups.length > 0
    ? matchedGroups.map((group) => group.id)
    : ["other"];
}

function getFileSection(riskBody, warningOrRisk) {
  const explicitSection = getExplicitFileSection(riskBody, warningOrRisk);

  if (explicitSection) {
    return explicitSection;
  }

  const ids = getFileSectionIds(riskBody, warningOrRisk);
  return ids.includes("other") ? "other" : ids.join("/");
}

function getFileSectionLabel(riskBody, warningOrRisk) {
  const explicitSection = getExplicitFileSection(riskBody, warningOrRisk);
  const explicitName =
    riskBody?.fileSectionName || warningOrRisk?.fileSectionName || "";

  if (explicitSection) {
    const label = explicitName || FILE_SECTION_LABELS[explicitSection] || "";
    return label ? `${explicitSection} ${label}` : safeText(explicitSection);
  }

  const ids = getFileSectionIds(riskBody, warningOrRisk).filter(
    (id) => id !== "other"
  );

  if (ids.length === 0) {
    return "其他风险";
  }

  const names = ids
    .map((id) => FILE_SECTION_GROUPS.find((group) => group.id === id)?.name)
    .filter(Boolean);

  return `${ids.join("/")} ${names.join(" / ")}`;
}

function isRiskInSection(item, sectionId, riskBody) {
  if (sectionId === "all") {
    return true;
  }

  return getFileSectionIds(riskBody, item).includes(sectionId);
}

function buildRiskTypeOptions(risks, warnings, riskBodies, selectedSectionId) {
  const options = new Map();

  function addOption(item, riskBody) {
    if (!isRiskInSection(item, selectedSectionId, riskBody)) {
      return;
    }

    const riskType = getRiskType(item, riskBody);

    if (!riskType || riskType === "unknown") {
      return;
    }

    options.set(riskType, {
      id: riskType,
      label: getRiskTypeLabelSafe(
        riskType,
        riskBody?.riskTypeLabel || item?.riskTypeLabel
      ),
    });
  }

  riskBodies.forEach((riskBody) => addOption(riskBody, riskBody));
  warnings.forEach((warning) =>
    addOption(warning, getRiskBodyById(riskBodies, warning.riskBodyId))
  );
  risks.forEach((risk) =>
    addOption(risk, risk.riskBody || getRiskBodyById(riskBodies, risk.riskBodyId))
  );

  return [...options.values()].sort((a, b) => {
    const orderA = RISK_TYPE_ORDER.indexOf(a.id);
    const orderB = RISK_TYPE_ORDER.indexOf(b.id);

    if (orderA === -1 && orderB === -1) {
      return a.label.localeCompare(b.label, "zh-CN");
    }

    if (orderA === -1) {
      return 1;
    }

    if (orderB === -1) {
      return -1;
    }

    return orderA - orderB;
  });
}

function getRecommendedMeasureText(warning, risk, riskBody) {
  const riskType = getRiskType(warning || risk, riskBody);
  const level = getWarningLevel(warning, risk, riskBody);
  const sourceWarning = {
    ...(warning || {}),
    riskType,
    level: warning?.level || level.level,
  };
  const names = getRecommendedMeasures(sourceWarning)
    .map((measure) => safeText(measure?.name || measure, ""))
    .filter(Boolean);

  return [...new Set(names)].slice(0, 3).join("、");
}

function getSuggestionText(warning, risk, riskBody) {
  const riskType = getRiskType(warning || risk, riskBody);
  const level = getWarningLevel(warning, risk, riskBody);
  const measureText = firstText(
    getRecommendedMeasures({
      ...(warning || {}),
      riskType,
      level: warning?.level || level.level,
    })
  );

  return (
    firstText(warning?.suggestion) ||
    firstText(risk?.suggestion) ||
    firstText(riskBody?.treatmentSuggestions) ||
    measureText ||
    FALLBACK_SUGGESTIONS[riskType] ||
    "建议结合现场资料和推进位置开展人工复核。"
  );
}

function getReasonText(warning, risk, riskBody) {
  return (
    firstText(warning?.reason) ||
    firstText(risk?.reason) ||
    firstText(risk?.warningReason) ||
    firstText(riskBody?.description) ||
    firstText(riskBody?.desc) ||
    `${safeText(riskBody?.name, "该风险体")}需结合当前推进位置进行人工核查。`
  );
}

function buildWarningListItem(warning, riskBodies) {
  const riskBody = getRiskBodyById(riskBodies, warning.riskBodyId);
  const riskType = getRiskType(warning, riskBody);
  const level = getWarningLevel(warning, null, riskBody);
  const color = getRiskLevelColor(warning, riskBody, level.level);
  const riskBodyId = warning.riskBodyId || riskBody?.id || warning.id;

  return {
    id: warning.id || `warning-${riskBodyId}`,
    kind: "warning",
    warning,
    risk: null,
    riskBody,
    riskBodyId,
    riskBodyName: safeText(
      warning.riskBodyName || riskBody?.name || riskBody?.code,
      "未知风险体"
    ),
    workingFaceName: safeText(warning.workingFaceName, "当前工作面"),
    riskType,
    riskTypeLabel: getRiskTypeLabelSafe(
      riskType,
      riskBody?.riskTypeLabel || warning.riskTypeLabel
    ),
    fileSection: getFileSection(riskBody, warning),
    fileSectionLabel: getFileSectionLabel(riskBody, warning),
    sectionIds: getFileSectionIds(riskBody, warning),
    level: level.level,
    levelLabel: level.label,
    color,
    distance: toFiniteNumber(warning.distance),
    reason: getReasonText(warning, null, riskBody),
    suggestion: getSuggestionText(warning, null, riskBody),
    measureText: getRecommendedMeasureText(warning, null, riskBody),
  };
}

function buildNearestRiskListItem(risk, riskBodies, warnings, index) {
  const riskBody =
    risk.riskBody || getRiskBodyById(riskBodies, risk.riskBodyId);
  const matchedWarning = warnings.find(
    (warning) => warning.riskBodyId === (risk.riskBodyId || riskBody?.id)
  );
  const riskType = getRiskType(risk, riskBody);
  const level = getWarningLevel(matchedWarning, risk, riskBody);
  const color = getRiskLevelColor(matchedWarning || risk, riskBody, level.level);
  const riskBodyId = risk.riskBodyId || riskBody?.id || `nearest-${index}`;

  return {
    id: `${riskBodyId}-nearest-${index}`,
    kind: "nearest",
    warning: matchedWarning || null,
    risk,
    riskBody,
    riskBodyId,
    riskBodyName: safeText(
      risk.riskBodyName || matchedWarning?.riskBodyName || riskBody?.name,
      "未知风险体"
    ),
    riskType,
    riskTypeLabel: getRiskTypeLabelSafe(
      riskType,
      risk.riskTypeLabel || riskBody?.riskTypeLabel
    ),
    fileSection: getFileSection(riskBody, risk),
    fileSectionLabel: getFileSectionLabel(riskBody, risk),
    sectionIds: getFileSectionIds(riskBody, risk),
    level: level.level,
    levelLabel: level.label,
    color,
    distance: toFiniteNumber(risk.distance),
    reason: getReasonText(matchedWarning, risk, riskBody),
    suggestion: getSuggestionText(matchedWarning, risk, riskBody),
    measureText: getRecommendedMeasureText(matchedWarning, risk, riskBody),
    rank: index + 1,
  };
}

function filterRiskItems(items, selectedSectionId, selectedRiskType) {
  return items.filter((item) => {
    const sectionMatched =
      selectedSectionId === "all" || item.sectionIds.includes(selectedSectionId);
    const riskTypeMatched =
      selectedRiskType === "all" || item.riskType === selectedRiskType;

    return sectionMatched && riskTypeMatched;
  });
}

function getHighestWarning(warnings, riskBodies) {
  return warnings.reduce((highest, warning) => {
    const riskBody = getRiskBodyById(riskBodies, warning.riskBodyId);
    const currentLevel = getWarningLevel(warning, null, riskBody).level;
    const highestLevel = highest
      ? getWarningLevel(
          highest,
          null,
          getRiskBodyById(riskBodies, highest.riskBodyId)
        ).level
      : "none";

    return RISK_LEVEL_RANK[currentLevel] > RISK_LEVEL_RANK[highestLevel]
      ? warning
      : highest;
  }, null);
}

function getSectionFilterLabel(sectionId) {
  return SECTION_FILTERS.find((item) => item.id === sectionId)?.label || "全部";
}

function getSectionDescription(sectionId) {
  return (
    FILE_SECTION_GROUPS.find((group) => group.id === sectionId)?.description ||
    "显示全部风险章节"
  );
}

function EmptyPanel({ count, message }) {
  return (
    <section className="fixed bottom-6 right-5 z-20 flex max-h-[38vh] w-[360px] flex-col overflow-hidden border border-white/10 bg-slate-950/86 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-cyan-100">风险预警</div>
          <div className="text-2xl font-semibold">{count}</div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 text-sm leading-6 text-slate-400">
        {message}
      </div>
    </section>
  );
}

function FilterButton({ selected, children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      className={`border px-2 py-1 text-[11px] transition ${
        selected
          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 text-slate-400 hover:text-slate-100"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RiskListItem({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`block w-full cursor-pointer border-b p-4 text-left transition ${
        selected
          ? "border-cyan-300/30 bg-cyan-300/10"
          : "border-white/[0.06] hover:bg-white/[0.04]"
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.rank && (
            <span className="mr-2 text-xs text-slate-500">{item.rank}.</span>
          )}
          <span className="text-sm font-semibold text-slate-100">
            {item.riskBodyName}
          </span>
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-slate-200">
          {formatDistanceSafe(item.distance)}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="border border-white/10 px-2 py-1 text-slate-300">
          {item.riskTypeLabel}
        </span>
        <span className="border border-white/10 px-2 py-1 text-slate-300">
          {item.fileSectionLabel}
        </span>
        <span
          className="border px-2 py-1 font-semibold"
          style={{ borderColor: `${item.color}80`, color: item.color }}
        >
          {item.levelLabel}
        </span>
        {selected && (
          <span className="border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-cyan-100">
            已定位
          </span>
        )}
      </div>

      <div className="text-[12px] leading-5 text-slate-300">
        原因：{item.reason}
      </div>
      <div className="mt-1 text-[12px] leading-5 text-cyan-100">
        建议：{item.suggestion}
      </div>
      {item.measureText && (
        <div className="mt-1 text-[11px] leading-5 text-slate-500">
          措施：{item.measureText}
        </div>
      )}
    </button>
  );
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
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [selectedRiskType, setSelectedRiskType] = useState("all");
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
  const warningItems = useMemo(
    () =>
      currentWarnings.map((warning) => buildWarningListItem(warning, riskBodies)),
    [currentWarnings, riskBodies]
  );
  const nearestRiskItems = useMemo(
    () =>
      summary.nearestRisks.map((risk, index) =>
        buildNearestRiskListItem(risk, riskBodies, currentWarnings, index)
      ),
    [currentWarnings, riskBodies, summary.nearestRisks]
  );
  const riskTypeOptions = useMemo(
    () =>
      buildRiskTypeOptions(
        summary.nearestRisks,
        currentWarnings,
        riskBodies,
        selectedSectionId
    ),
    [currentWarnings, riskBodies, selectedSectionId, summary.nearestRisks]
  );
  const effectiveSelectedRiskType =
    selectedRiskType === "all" ||
    riskTypeOptions.some((option) => option.id === selectedRiskType)
      ? selectedRiskType
      : "all";
  const filteredWarningItems = useMemo(
    () =>
      filterRiskItems(warningItems, selectedSectionId, effectiveSelectedRiskType),
    [effectiveSelectedRiskType, selectedSectionId, warningItems]
  );
  const filteredNearestRiskItems = useMemo(
    () =>
      filterRiskItems(
        nearestRiskItems,
        selectedSectionId,
        effectiveSelectedRiskType
      ),
    [effectiveSelectedRiskType, nearestRiskItems, selectedSectionId]
  );
  const activeSelectedRiskBodyId =
    selectedRiskBodyId !== undefined ? selectedRiskBodyId : localSelectedRiskBodyId;
  const hasActiveFilter =
    selectedSectionId !== "all" || effectiveSelectedRiskType !== "all";
  const hasFilteredData =
    filteredWarningItems.length > 0 || filteredNearestRiskItems.length > 0;
  const highestWarning = useMemo(
    () => getHighestWarning(currentWarnings, riskBodies),
    [currentWarnings, riskBodies]
  );
  const overallRisk = useMemo(() => {
    if (highestWarning) {
      const riskBody = getRiskBodyById(riskBodies, highestWarning.riskBodyId);
      const level = getWarningLevel(highestWarning, null, riskBody);

      return {
        label: level.label,
        color: getRiskLevelColor(highestWarning, riskBody, level.level),
      };
    }

    if (summary.highestLevel && summary.highestLevel !== "none") {
      return {
        label: summary.highestLabel,
        color:
          summary.highestColor ||
          RISK_LEVEL_COLORS[summary.highestLevel] ||
          "#94A3B8",
      };
    }

    return { label: "当前无明显风险", color: "#94A3B8" };
  }, [highestWarning, riskBodies, summary]);
  const selectedFilterText = useMemo(() => {
    const parts = [];

    if (selectedSectionId !== "all") {
      parts.push(getSectionFilterLabel(selectedSectionId));
    }

    if (effectiveSelectedRiskType !== "all") {
      parts.push(getRiskTypeLabelSafe(effectiveSelectedRiskType));
    }

    return parts.join(" / ");
  }, [effectiveSelectedRiskType, selectedSectionId]);

  function selectRiskBodyFromPanel({ riskBody, warning, risk }) {
    const riskBodyId = riskBody?.id || warning?.riskBodyId || risk?.riskBodyId;

    if (!riskBodyId) {
      return;
    }

    const resolvedRiskBody =
      riskBody || getRiskBodyById(riskBodies, riskBodyId) || risk?.riskBody || null;
    const riskType = getRiskType(warning || risk, resolvedRiskBody);
    const level = getWarningLevel(warning, risk, resolvedRiskBody);
    const color =
      warning?.color ||
      risk?.matchedLevel?.color ||
      resolvedRiskBody?.color ||
      RISK_LEVEL_COLORS[level.level] ||
      "#94A3B8";
    const payload = {
      ...(warning || {}),
      id:
        warning?.id ||
        `${summary.workingFaceId || "working-face"}-${riskBodyId}`,
      workingFaceId: warning?.workingFaceId || summary.workingFaceId,
      workingFaceName:
        warning?.workingFaceName || summary.workingFaceName || "当前工作面",
      riskBodyId,
      riskBodyName: safeText(
        resolvedRiskBody?.name || warning?.riskBodyName || risk?.riskBodyName,
        "未知风险体"
      ),
      riskType,
      riskTypeLabel: getRiskTypeLabelSafe(
        riskType,
        resolvedRiskBody?.riskTypeLabel || warning?.riskTypeLabel || risk?.riskTypeLabel
      ),
      fileSection: getFileSection(resolvedRiskBody, warning || risk),
      fileSectionLabel: getFileSectionLabel(resolvedRiskBody, warning || risk),
      distance: toFiniteNumber(warning?.distance ?? risk?.distance, undefined),
      level: level.level,
      label: level.label,
      color,
      reason: getReasonText(warning, risk, resolvedRiskBody),
      suggestion: getSuggestionText(warning, risk, resolvedRiskBody),
      status: warning?.status || "active",
    };

    if (resolvedRiskBody) {
      setSelectedObject(resolvedRiskBody);
    }

    setLocalSelectedRiskBodyId(riskBodyId);
    onSelectRiskBody?.(riskBodyId, payload);
    onSelectWarning?.(payload);
  }

  function handleSelectWarning(item) {
    selectRiskBodyFromPanel({
      riskBody: item.riskBody,
      warning: item.warning,
      risk: item.risk,
    });
  }

  function handleSelectRisk(item) {
    selectRiskBodyFromPanel({
      riskBody: item.riskBody,
      warning: item.warning,
      risk: item.risk,
    });
  }

  if (!currentWorkingFace) {
    return (
      <EmptyPanel
        count={warnings.length}
        message="暂无工作面数据，无法进行风险扫描。"
      />
    );
  }

  if (riskBodies.length === 0) {
    return (
      <EmptyPanel
        count={currentWarnings.length}
        message="暂无风险体数据，请先打开或导入风险体模拟数据。"
      />
    );
  }

  return (
    <section className="fixed bottom-6 right-5 z-20 flex max-h-[52vh] w-[420px] flex-col overflow-hidden border border-white/10 bg-slate-950/88 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-cyan-100">预警分析</div>
            <div className="mt-1 truncate text-[12px] text-slate-300">
              当前工作面：{summary.workingFaceName}
            </div>
          </div>
          <div
            className="shrink-0 text-right text-sm font-semibold"
            style={{ color: overallRisk.color }}
          >
            {overallRisk.label}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">当前预警</div>
            <div className="mt-1 font-semibold text-slate-100">
              {currentWarnings.length} 条
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">最近距离</div>
            <div className="mt-1 font-semibold text-slate-100">
              {formatDistanceSafe(summary.nearestDistance)}
            </div>
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-2 py-2">
            <div className="text-slate-500">主要风险</div>
            <div className="mt-1 truncate font-semibold text-slate-100">
              {summary.mainRiskTypes.join("、") || "当前无明显风险"}
            </div>
          </div>
        </div>

        {hasActiveFilter && (
          <div className="mt-2 border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1 text-[11px] text-cyan-100">
            当前筛选：{selectedFilterText}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {SECTION_FILTERS.map((filter) => (
            <FilterButton
              key={filter.id}
              selected={selectedSectionId === filter.id}
              title={getSectionDescription(filter.id)}
              onClick={() => {
                setSelectedSectionId(filter.id);
                setSelectedRiskType("all");
              }}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <FilterButton
            selected={effectiveSelectedRiskType === "all"}
            title="显示全部风险类型"
            onClick={() => setSelectedRiskType("all")}
          >
            全部类型
          </FilterButton>
          {riskTypeOptions.map((option) => (
            <FilterButton
              key={option.id}
              selected={effectiveSelectedRiskType === option.id}
              title={option.label}
              onClick={() => setSelectedRiskType(option.id)}
            >
              {option.label}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {!hasFilteredData && (
          <div className="p-4 text-sm leading-6 text-slate-400">
            {hasActiveFilter
              ? "当前筛选条件下暂无风险或预警。"
              : "当前推进位置无自动预警，以下展示最近风险体供人工核查。"}
          </div>
        )}

        {filteredWarningItems.length > 0 && (
          <>
            <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-semibold text-slate-400">
              一、当前预警
            </div>
            {filteredWarningItems.map((item) => (
              <RiskListItem
                key={item.id}
                item={item}
                selected={activeSelectedRiskBodyId === item.riskBodyId}
                onSelect={handleSelectWarning}
              />
            ))}
          </>
        )}

        {currentWarnings.length === 0 && filteredNearestRiskItems.length > 0 && (
          <div className="border-b border-white/[0.06] px-4 py-3 text-sm leading-6 text-slate-400">
            当前推进位置无自动预警，以下展示最近风险体供人工核查。
          </div>
        )}

        {filteredNearestRiskItems.length > 0 && (
          <>
            <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-semibold text-slate-400">
              二、邻近风险体 Top 3
            </div>
            {filteredNearestRiskItems.map((item) => (
              <RiskListItem
                key={item.id}
                item={item}
                selected={activeSelectedRiskBodyId === item.riskBodyId}
                onSelect={handleSelectRisk}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
