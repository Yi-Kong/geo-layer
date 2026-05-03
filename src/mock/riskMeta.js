export const RISK_TYPES = {
  GOAF_WATER: "goaf_water",
  WATER_INRUSH: "water_inrush",
  GAS: "gas",
  SOFT_LAYER: "soft_layer",
  SMALL_MINE_DAMAGE: "small_mine_damage",
  GOAF: "goaf",
  ABANDONED_SHAFT: "abandoned_shaft",
  POOR_SEALED_BOREHOLE: "poor_sealed_borehole",
  FAULT_INFLUENCE: "fault_influence",
};

export const RISK_CATEGORIES = {
  WATER: "water",
  GAS: "gas",
  GEOLOGY: "geology",
  HIDDEN_HAZARD: "hidden_hazard",
};

export const fileSectionMeta = {
  "7.5": "小窑破坏区",
  "7.6": "奥灰带压矿井突水危险区",
  "7.7": "瓦斯富集区和软分层分布区",
  "7.5/7.6": "小窑破坏区 / 奥灰带压矿井突水危险区",
  "7.6/7.7": "奥灰带压矿井突水危险区 / 瓦斯富集区和软分层分布区",
};

export const riskLevelMeta = {
  low: { label: "低风险", color: "#2A9D8F" },
  medium: { label: "一般", color: "#E9C46A" },
  high: { label: "较大", color: "#F4A261" },
  critical: { label: "严重", color: "#E63946" },
};

export const riskTypeMeta = {
  [RISK_TYPES.GOAF_WATER]: {
    label: "采空积水区 / 老空水",
    category: RISK_CATEGORIES.WATER,
    fileSection: "7.5",
    fileSectionName: fileSectionMeta["7.5"],
    geometryType: "volume",
    defaultColor: "#2563EB",
    treatmentSuggestions: [
      "开展超前探放水",
      "补充瞬变电磁或钻探验证",
      "核查老空区积水边界",
      "必要时留设防水煤柱",
    ],
    warningRules: {
      criticalDistance: 50,
      highDistance: 100,
      mediumDistance: 200,
    },
  },
  [RISK_TYPES.WATER_INRUSH]: {
    label: "富水区 / 奥灰突水危险区",
    category: RISK_CATEGORIES.WATER,
    fileSection: "7.6",
    fileSectionName: fileSectionMeta["7.6"],
    geometryType: "volume",
    defaultColor: "#06B6D4",
    treatmentSuggestions: [
      "开展底板突水危险性复核",
      "对富水异常区进行注浆加固",
      "必要时疏水降压",
      "补充水文地质孔或物探验证",
    ],
    warningRules: {
      criticalDistance: 80,
      highDistance: 150,
      mediumDistance: 300,
    },
  },
  [RISK_TYPES.GAS]: {
    label: "瓦斯富集区",
    category: RISK_CATEGORIES.GAS,
    fileSection: "7.7",
    fileSectionName: fileSectionMeta["7.7"],
    geometryType: "volume",
    defaultColor: "#F97316",
    treatmentSuggestions: [
      "加强瓦斯含量和压力复测",
      "布置区域预抽钻孔",
      "开展抽采达标评价",
      "必要时调整采掘推进速度",
    ],
    warningRules: {
      criticalDistance: 40,
      highDistance: 80,
      mediumDistance: 150,
    },
  },
  [RISK_TYPES.SOFT_LAYER]: {
    label: "软分层",
    category: RISK_CATEGORIES.GAS,
    fileSection: "7.7",
    fileSectionName: fileSectionMeta["7.7"],
    geometryType: "layer",
    defaultColor: "#D97706",
    treatmentSuggestions: [
      "加强软分层分布探查",
      "结合瓦斯测点复核突出风险",
      "优化抽采钻孔布置",
      "加强掘进期间瓦斯监测",
    ],
    warningRules: {
      criticalDistance: 30,
      highDistance: 60,
      mediumDistance: 120,
    },
  },
  [RISK_TYPES.SMALL_MINE_DAMAGE]: {
    label: "小窑破坏区",
    category: RISK_CATEGORIES.HIDDEN_HAZARD,
    fileSection: "7.5",
    fileSectionName: fileSectionMeta["7.5"],
    geometryType: "zone",
    defaultColor: "#B45309",
    treatmentSuggestions: [
      "核查小窑破坏区边界",
      "开展超前物探和钻探验证",
      "控制采掘接近距离",
      "编制专项治理措施",
    ],
    warningRules: {
      criticalDistance: 60,
      highDistance: 120,
      mediumDistance: 240,
    },
  },
  [RISK_TYPES.GOAF]: {
    label: "采空区",
    category: RISK_CATEGORIES.HIDDEN_HAZARD,
    fileSection: "7.5",
    fileSectionName: fileSectionMeta["7.5"],
    geometryType: "zone",
    defaultColor: "#64748B",
    treatmentSuggestions: [
      "核查采空区边界",
      "分析采空区与工作面空间关系",
      "开展隐蔽致灾因素排查",
      "必要时采取超前治理措施",
    ],
    warningRules: {
      criticalDistance: 50,
      highDistance: 100,
      mediumDistance: 200,
    },
  },
  [RISK_TYPES.ABANDONED_SHAFT]: {
    label: "废弃井筒",
    category: RISK_CATEGORIES.HIDDEN_HAZARD,
    fileSection: "7.5/7.6",
    fileSectionName: fileSectionMeta["7.5/7.6"],
    geometryType: "point",
    defaultColor: "#FDE68A",
    treatmentSuggestions: [
      "核查废弃井筒封闭情况",
      "评估井筒导水风险",
      "必要时进行注浆封堵",
      "采掘接近前进行专项探查",
    ],
    warningRules: {
      criticalDistance: 50,
      highDistance: 100,
      mediumDistance: 200,
    },
  },
  [RISK_TYPES.POOR_SEALED_BOREHOLE]: {
    label: "封闭不良钻孔",
    category: RISK_CATEGORIES.HIDDEN_HAZARD,
    fileSection: "7.5/7.6",
    fileSectionName: fileSectionMeta["7.5/7.6"],
    geometryType: "point",
    defaultColor: "#FBBF24",
    treatmentSuggestions: [
      "复核钻孔封闭质量",
      "分析钻孔导水可能性",
      "必要时重新封孔或注浆",
      "采掘接近前加强探查",
    ],
    warningRules: {
      criticalDistance: 40,
      highDistance: 80,
      mediumDistance: 160,
    },
  },
  [RISK_TYPES.FAULT_INFLUENCE]: {
    label: "断层影响带",
    category: RISK_CATEGORIES.GEOLOGY,
    fileSection: "7.6/7.7",
    fileSectionName: fileSectionMeta["7.6/7.7"],
    geometryType: "zone",
    defaultColor: "#FB7185",
    treatmentSuggestions: [
      "复核断层位置和落差",
      "分析断层导水或瓦斯富集风险",
      "开展超前探测",
      "必要时采取注浆加固或调整采掘方案",
    ],
    warningRules: {
      criticalDistance: 50,
      highDistance: 100,
      mediumDistance: 200,
    },
  },
};

function getDefaultGeometryType(body, typeMeta) {
  if (body.geometryType) {
    return body.geometryType;
  }

  if (typeMeta.geometryType) {
    return typeMeta.geometryType;
  }

  return Array.isArray(body.points) && body.points.length > 0 ? "volume" : "point";
}

export function enrichRiskBody(body = {}) {
  const typeMeta = riskTypeMeta[body.riskType] || {};
  const levelMeta = riskLevelMeta[body.riskLevel] || {};
  const fileSection = body.fileSection || typeMeta.fileSection || "";
  const treatmentSuggestions =
    body.treatmentSuggestions || typeMeta.treatmentSuggestions || [];

  return {
    ...body,
    id: body.id || body.code || "",
    code: body.code || body.id || "",
    name: body.name || body.code || body.id || "未命名风险体",
    type: body.type || body.riskType || "risk_body",
    riskType: body.riskType || "",
    riskTypeLabel: body.riskTypeLabel || typeMeta.label || "未知风险",
    riskCategory: body.riskCategory || typeMeta.category || "unknown",
    fileSection,
    fileSectionName:
      body.fileSectionName ||
      typeMeta.fileSectionName ||
      fileSectionMeta[fileSection] ||
      "",
    geometryType: getDefaultGeometryType(body, typeMeta),
    position: Array.isArray(body.position) ? body.position : [],
    size: Array.isArray(body.size) ? body.size : [],
    points: Array.isArray(body.points) ? body.points : [],
    riskLevel: body.riskLevel || "",
    riskLevelLabel: body.riskLevelLabel || levelMeta.label || "未分级",
    influenceRadius: body.influenceRadius ?? body.influenceRange ?? 0,
    color: body.color || typeMeta.defaultColor || levelMeta.color || "#94A3B8",
    visible: body.visible ?? true,
    properties: body.properties || {},
    treatmentSuggestions: [...treatmentSuggestions],
    warningRules: {
      ...(typeMeta.warningRules || {}),
      ...(body.warningRules || {}),
    },
  };
}

export function enrichRiskBodies(items = []) {
  return items.map((item) => enrichRiskBody(item));
}
