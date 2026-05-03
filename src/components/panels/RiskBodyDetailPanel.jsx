import { getRecommendedMeasures } from "../../services/measureService";
import { calcEntityDistance, moveBoundary } from "../../utils/distance";

const RISK_LEVEL_META = {
  critical: { label: "严重", color: "#E63946" },
  high: { label: "较大", color: "#F4A261" },
  medium: { label: "一般", color: "#E9C46A" },
  low: { label: "低风险", color: "#22c55e" },
  none: { label: "无预警", color: "#22c55e" },
};

const RISK_TYPE_LABELS = {
  goaf_water: "采空积水区 / 老空水",
  goaf_water_area: "采空积水区 / 老空水",
  water_inrush: "富水区 / 突水危险区",
  water_rich_area: "富水区 / 突水危险区",
  water_inrush_point: "突水点",
  gas: "瓦斯富集区",
  gas_rich_area: "瓦斯富集区",
  soft_layer: "软分层",
  small_mine_damage: "小窑破坏区",
  small_mine_damage_area: "小窑破坏区",
  goaf: "采空区",
  goaf_area: "采空区",
  abandoned_shaft: "废弃井筒",
  poor_sealed_borehole: "封闭不良钻孔",
  fault_influence: "断层影响带",
  fault_influence_zone: "断层影响带",
};

const RISK_CATEGORY_LABELS = {
  water: "水害",
  gas: "瓦斯",
  geology: "地质构造",
  hidden_hazard: "隐蔽致灾因素",
  unknown: "--",
};

const FILE_SECTION_LABELS = {
  "7.5": "小窑破坏区",
  "7.6": "奥灰带压矿井突水危险区",
  "7.7": "瓦斯富集区和软分层分布区",
  "7.5/7.6": "小窑破坏区 / 奥灰带压矿井突水危险区",
  "7.6/7.7": "奥灰带压矿井突水危险区 / 瓦斯富集区和软分层分布区",
};

const GEOMETRY_TYPE_LABELS = {
  volume: "三维体",
  zone: "影响区",
  point: "点状对象",
  layer: "层状对象",
  polygon: "面状对象",
};

const STATUS_LABELS = {
  active: "生效中",
  processing: "处置中",
  closed: "已关闭",
  resolved: "已解除",
  pending: "待处置",
};

const FALLBACK_REASONS = {
  goaf_water:
    "该风险体属于采空积水区或老空水风险，可能对采掘工作面造成突水威胁，需结合工作面推进距离进行超前探查。",
  water_inrush:
    "该风险体属于富水区或突水危险区，可能与含水层、断层或底板导水构造有关，需要开展突水危险性评价。",
  gas:
    "该风险体属于瓦斯富集区，需结合瓦斯含量、瓦斯压力、煤层赋存和构造条件综合判断突出风险。",
  soft_layer:
    "该风险体属于软分层相关风险，可能影响瓦斯赋存、抽采效果和掘进安全。",
  small_mine_damage:
    "该风险体属于小窑破坏区，可能存在边界不清、老巷遗留、积水或采空扰动风险。",
  goaf:
    "该风险体属于采空区，需核查空间边界、积水情况及其与当前采掘工程的关系。",
  abandoned_shaft:
    "该风险体属于废弃井筒，需复核封闭质量、井筒位置及导水、漏风等隐蔽风险。",
  poor_sealed_borehole:
    "该风险体属于封闭不良钻孔，可能形成导水或瓦斯异常通道，采掘接近前需复查封孔质量。",
  fault_influence:
    "该风险体属于断层影响带，需关注导水、瓦斯富集和煤层连续性破坏等风险。",
};

const FALLBACK_SUGGESTIONS = {
  goaf_water: [
    "开展超前探放水",
    "补充瞬变电磁或钻探验证",
    "核查老空区积水边界",
    "必要时留设防水煤柱",
  ],
  water_inrush: [
    "开展底板突水危险性复核",
    "对富水异常区进行注浆加固",
    "必要时疏水降压",
    "补充水文地质孔或物探验证",
  ],
  gas: [
    "加强瓦斯含量和压力复测",
    "布置区域预抽钻孔",
    "开展抽采达标评价",
    "必要时调整采掘推进速度",
  ],
  soft_layer: [
    "加强软分层分布探查",
    "结合瓦斯测点复核突出风险",
    "优化抽采钻孔布置",
    "加强掘进期间瓦斯监测",
  ],
  small_mine_damage: [
    "核查小窑破坏区边界",
    "开展超前物探和钻探验证",
    "控制采掘接近距离",
    "编制专项治理措施",
  ],
  goaf: [
    "核查采空区边界",
    "分析采空区与工作面空间关系",
    "开展隐蔽致灾因素排查",
    "必要时采取超前治理措施",
  ],
  abandoned_shaft: [
    "核查废弃井筒封闭情况",
    "评估井筒导水风险",
    "必要时进行注浆封堵",
    "采掘接近前进行专项探查",
  ],
  poor_sealed_borehole: [
    "复核钻孔封闭质量",
    "分析钻孔导水可能性",
    "必要时重新封孔或注浆",
    "采掘接近前加强探查",
  ],
  fault_influence: [
    "复核断层位置和落差",
    "分析断层导水或瓦斯富集风险",
    "开展超前探测",
    "必要时采取注浆加固或调整采掘方案",
  ],
};

const PROPERTY_SKIP_KEYS = new Set(["description", "desc"]);

function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function normalizeRiskType(riskType, legacyType) {
  switch (riskType || legacyType) {
    case "goaf_water_area":
    case "goaf_water":
      return "goaf_water";
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
    case "goaf_area":
    case "goaf":
      return "goaf";
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
      return riskType || legacyType || "";
  }
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

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return value >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, "");
}

function formatDistanceValue(value) {
  const distance = toFiniteNumber(value);

  if (!Number.isFinite(distance)) {
    return "--";
  }

  return `${formatNumber(distance)} m`;
}

function formatMeterValue(value) {
  if (typeof value === "string" && /[a-zA-Z\u4e00-\u9fa5]/.test(value)) {
    return formatValue(value);
  }

  const number = toFiniteNumber(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${formatNumber(number)} m`;
}

function formatValue(value) {
  if (isEmptyValue(value)) {
    return "--";
  }

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (Array.isArray(value)) {
    const text = value
      .map((item) => formatValue(item))
      .filter((item) => item && item !== "--")
      .join("、");

    return text || "--";
  }

  if (typeof value === "object") {
    const knownValue = value.name || value.label || value.code || value.id;

    if (knownValue) {
      return formatValue(knownValue);
    }

    const text = Object.entries(value)
      .filter(([, item]) => !isEmptyValue(item) && typeof item !== "object")
      .slice(0, 3)
      .map(([key, item]) => `${key}: ${formatValue(item)}`)
      .join("、");

    return text || "--";
  }

  const text = String(value).trim();
  return text && text !== "undefined" && text !== "null" ? text : "--";
}

function getRiskLevelColor(level) {
  return RISK_LEVEL_META[level]?.color || "#94a3b8";
}

function getRiskLevelLabel(riskBody = {}) {
  const level = riskBody.riskLevel || riskBody.level;

  if (!level) {
    return "未分级";
  }

  return riskBody.riskLevelLabel || RISK_LEVEL_META[level]?.label || "未分级";
}

function getWarningLevelLabel(warning, riskBody) {
  if (warning?.label) {
    return warning.label;
  }

  if (warning?.level) {
    return RISK_LEVEL_META[warning.level]?.label || warning.level;
  }

  return getRiskLevelLabel(riskBody);
}

function getRiskTypeLabel(riskBody = {}) {
  const normalizedRiskType = normalizeRiskType(riskBody.riskType, riskBody.type);

  return (
    riskBody.riskTypeLabel ||
    RISK_TYPE_LABELS[normalizedRiskType] ||
    RISK_TYPE_LABELS[riskBody.riskType] ||
    RISK_TYPE_LABELS[riskBody.type] ||
    riskBody.label ||
    normalizedRiskType ||
    "--"
  );
}

function getFileSectionLabel(riskBody = {}) {
  const section = formatValue(riskBody.fileSection);
  const sectionName =
    riskBody.fileSectionName ||
    FILE_SECTION_LABELS[riskBody.fileSection] ||
    "";

  if (section === "--" && !sectionName) {
    return "";
  }

  return [section === "--" ? "" : section, sectionName].filter(Boolean).join(" ");
}

function getGeometryTypeLabel(geometryType) {
  return GEOMETRY_TYPE_LABELS[geometryType] || formatValue(geometryType);
}

function getCategoryLabel(category) {
  return RISK_CATEGORY_LABELS[category] || formatValue(category);
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || formatValue(status);
}

function getDisplayProperties(properties = {}) {
  return Object.entries(properties)
    .filter(([key, value]) => !PROPERTY_SKIP_KEYS.has(key) && !isEmptyValue(value))
    .slice(0, 8);
}

function getRelatedWarnings(riskBody, warnings = []) {
  if (!riskBody || !Array.isArray(warnings)) {
    return [];
  }

  return warnings.filter((warning) => {
    if (!warning) {
      return false;
    }

    return (
      warning.riskBodyId === riskBody.id ||
      warning.riskBodyCode === riskBody.code ||
      warning.riskBodyName === riskBody.name
    );
  });
}

function getPrimaryWarning(relatedWarnings, workingFace) {
  if (!Array.isArray(relatedWarnings) || relatedWarnings.length === 0) {
    return null;
  }

  return (
    relatedWarnings.find(
      (warning) => workingFace?.id && warning.workingFaceId === workingFace.id
    ) || relatedWarnings[0]
  );
}

function getCenter(object) {
  if (Array.isArray(object?.position)) {
    return object.position;
  }

  const points = Array.isArray(object?.boundary) ? object.boundary : object?.points;

  if (Array.isArray(points) && points.length > 0) {
    const total = points.reduce(
      (sum, point) => [
        sum[0] + (Number(point?.[0]) || 0),
        sum[1] + (Number(point?.[1]) || 0),
        sum[2] + (Number(point?.[2]) || 0),
      ],
      [0, 0, 0]
    );

    return total.map((value) => value / points.length);
  }

  return [0, 0, 0];
}

function getCenterDistance(a, b) {
  const ac = getCenter(a);
  const bc = getCenter(b);

  return Math.sqrt(
    (ac[0] - bc[0]) ** 2 +
      (ac[1] - bc[1]) ** 2 +
      (ac[2] - bc[2]) ** 2
  );
}

function getAdvancedWorkingFace(workingFace, advanceDistance) {
  if (!workingFace) {
    return null;
  }

  const safeAdvanceDistance = toFiniteNumber(advanceDistance, 0);
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

function getApproxDistance(workingFace, riskBody, advanceDistance) {
  if (!workingFace || !riskBody) {
    return NaN;
  }

  const advancedWorkingFace = getAdvancedWorkingFace(
    workingFace,
    advanceDistance
  );
  const entityDistance = calcEntityDistance(advancedWorkingFace, riskBody);

  if (Number.isFinite(entityDistance)) {
    return entityDistance;
  }

  return getCenterDistance(advancedWorkingFace, riskBody);
}

function getRelationshipLabel(distance, influenceRadius, warning) {
  const warningLevel = warning?.level || warning?.riskLevel;

  if (Number.isFinite(distance) && Number.isFinite(influenceRadius)) {
    if (distance <= influenceRadius) {
      return "已进入影响范围";
    }

    if (warning && warningLevel && warningLevel !== "none") {
      return "接近风险体";
    }

    if (distance <= influenceRadius * 1.5) {
      return "接近风险体";
    }

    return "当前未进入影响范围";
  }

  return warning ? "接近风险体" : "暂无明显影响";
}

function getRiskReason(riskBody, warning) {
  if (warning?.reason) {
    return warning.reason;
  }

  if (riskBody?.reason || riskBody?.properties?.风险原因) {
    return riskBody.reason || riskBody.properties.风险原因;
  }

  const normalizedRiskType = normalizeRiskType(riskBody?.riskType, riskBody?.type);

  return (
    FALLBACK_REASONS[normalizedRiskType] ||
    "该风险体为模拟风险对象，需结合图件、现场揭露和工作面推进关系进行人工复核。"
  );
}

function normalizeSuggestions(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => !isEmptyValue(item));
  }

  return [value];
}

function getTreatmentSuggestions(riskBody, warning) {
  const bodySuggestions = normalizeSuggestions(riskBody?.treatmentSuggestions);

  if (bodySuggestions.length > 0) {
    return bodySuggestions;
  }

  const recommendedMeasures = warning ? getRecommendedMeasures(warning) : [];

  if (recommendedMeasures.length > 0) {
    return recommendedMeasures;
  }

  const normalizedRiskType = normalizeRiskType(riskBody?.riskType, riskBody?.type);

  return FALLBACK_SUGGESTIONS[normalizedRiskType] || [
    "持续跟踪工作面推进情况",
    "复核风险体边界和关键属性",
    "必要时编制专项治理措施",
  ];
}

function InfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12px] leading-5">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={`text-right text-slate-200 ${valueClassName}`}>
        {formatValue(value)}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="border-b border-white/[0.06] px-4 py-3">
      <div className="mb-2 text-xs font-semibold text-cyan-100">{title}</div>
      {children}
    </section>
  );
}

function SuggestionItem({ suggestion, index }) {
  if (typeof suggestion === "object" && suggestion !== null) {
    const detailText = [
      suggestion.type,
      suggestion.priority ? `优先级：${suggestion.priority}` : "",
      Array.isArray(suggestion.riskTypes)
        ? `适用风险：${suggestion.riskTypes.join("、")}`
        : "",
    ]
      .filter(Boolean)
      .join(" / ");

    return (
      <div className="border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[12px] leading-5">
        <div className="font-semibold text-cyan-50">
          {index + 1}. {formatValue(suggestion.name)}
        </div>
        {detailText && <div className="mt-1 text-slate-400">{detailText}</div>}
        {suggestion.description && (
          <div className="mt-1 text-slate-300">
            {formatValue(suggestion.description)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-[12px] leading-5 text-cyan-50">
      {index + 1}. {formatValue(suggestion)}
    </div>
  );
}

export default function RiskBodyDetailPanel({
  riskBody,
  workingFace,
  warnings = [],
  advanceDistance = 0,
  onClose,
}) {
  if (!riskBody) {
    return null;
  }

  const relatedWarnings = getRelatedWarnings(riskBody, warnings);
  const primaryWarning = getPrimaryWarning(relatedWarnings, workingFace);
  const riskLevel = riskBody.riskLevel || riskBody.level;
  const riskLevelColor = getRiskLevelColor(riskLevel);
  const riskLevelLabel = getRiskLevelLabel(riskBody);
  const riskTypeLabel = getRiskTypeLabel(riskBody);
  const fileSectionLabel = getFileSectionLabel(riskBody);
  const properties = getDisplayProperties(riskBody.properties);
  const suggestions = getTreatmentSuggestions(riskBody, primaryWarning);
  const warningDistance = toFiniteNumber(primaryWarning?.distance);
  const distance = Number.isFinite(warningDistance)
    ? warningDistance
    : getApproxDistance(workingFace, riskBody, advanceDistance);
  const influenceRadius = toFiniteNumber(riskBody.influenceRadius);
  const relationship = getRelationshipLabel(
    distance,
    influenceRadius,
    primaryWarning
  );
  const materialStatus =
    typeof riskBody.visible === "boolean"
      ? `${riskBody.visible ? "显示中" : "已隐藏"} / 模拟数据`
      : "模拟数据";

  return (
    <section className="fixed right-[420px] top-[84px] z-20 flex max-h-[calc(100vh-250px)] w-[360px] flex-col overflow-hidden border border-white/10 bg-slate-950/88 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-cyan-100">
              {riskBody.name || "未命名风险体"}
            </div>
            <div className="mt-1 text-[12px] text-slate-400">
              {riskTypeLabel}
            </div>
          </div>
          <button
            className="shrink-0 cursor-pointer border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span
            className="border px-2 py-1 font-semibold"
            style={{ borderColor: `${riskLevelColor}80`, color: riskLevelColor }}
          >
            {riskLevelLabel}
          </span>
          {fileSectionLabel && (
            <span className="border border-white/10 px-2 py-1 text-slate-300">
              对应：{fileSectionLabel}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Section title="基础信息">
          <div className="space-y-1">
            <InfoRow label="编码" value={riskBody.code || riskBody.id} />
            <InfoRow label="类型" value={riskTypeLabel} />
            <InfoRow label="分类" value={getCategoryLabel(riskBody.riskCategory)} />
            <InfoRow label="文件章节" value={fileSectionLabel || "--"} />
            <InfoRow
              label="几何类型"
              value={getGeometryTypeLabel(riskBody.geometryType)}
            />
            <InfoRow
              label="影响半径"
              value={
                Number.isFinite(influenceRadius)
                  ? formatMeterValue(influenceRadius)
                  : "--"
              }
            />
            <InfoRow label="资料状态" value={materialStatus} />
          </div>
        </Section>

        <Section title="与当前工作面关系">
          <div className="space-y-1">
            <InfoRow
              label="当前工作面"
              value={workingFace?.name || workingFace?.code || "--"}
            />
            <InfoRow
              label="当前推进距离"
              value={formatMeterValue(advanceDistance)}
            />
            <InfoRow label="与风险体距离" value={formatDistanceValue(distance)} />
            <InfoRow label="关系判断" value={relationship} />
            <InfoRow
              label="预警等级"
              value={getWarningLevelLabel(primaryWarning, riskBody)}
              valueClassName="font-semibold"
            />
          </div>
        </Section>

        <Section title="关键属性">
          {properties.length === 0 ? (
            <div className="text-sm text-slate-400">暂无关键属性。</div>
          ) : (
            <div className="max-h-[190px] space-y-1 overflow-auto pr-1">
              {properties.map(([key, value]) => (
                <InfoRow key={key} label={key} value={value} />
              ))}
            </div>
          )}
        </Section>

        <Section title="风险原因">
          <div className="text-[12px] leading-5 text-slate-300">
            {formatValue(getRiskReason(riskBody, primaryWarning))}
          </div>
        </Section>

        <Section title="治理建议">
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={`${formatValue(suggestion)}-${index}`}
                suggestion={suggestion}
                index={index}
              />
            ))}
          </div>
        </Section>

        <Section title="关联预警">
          {relatedWarnings.length === 0 ? (
            <div className="text-sm text-slate-400">
              当前风险体暂无自动预警记录。
            </div>
          ) : (
            <div className="space-y-2">
              {relatedWarnings.map((warning, index) => {
                const warningLevel = warning.level || warning.riskLevel;
                const warningColor = warning.color || getRiskLevelColor(warningLevel);

                return (
                  <div
                    key={warning.id || `${riskBody.id}-warning-${index}`}
                    className="border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: warningColor }}
                      >
                        {getWarningLevelLabel(warning, riskBody)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {getStatusLabel(warning.status)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <InfoRow
                        label="预警距离"
                        value={formatDistanceValue(warning.distance)}
                      />
                      <InfoRow label="预警原因" value={warning.reason} />
                      <InfoRow label="处置建议" value={warning.suggestion} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </section>
  );
}
