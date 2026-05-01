const RISK_TYPE_LABELS = {
  goaf_water: "老空水风险",
  water_inrush: "突水风险",
  gas: "瓦斯风险",
};

const OBJECT_TYPE_LABELS = {
  mine: "矿井",
  stratum: "地层",
  coal_seam: "煤层",
  working_face: "工作面",
  goaf_water_area: "采空积水区",
  water_rich_area: "富水区",
  gas_rich_area: "瓦斯富集区",
  legacy_stratum: "原地层模型",
};

const STATUS_LABELS = {
  mining: "回采中",
  planned: "计划中",
  paused: "暂停",
  completed: "已完成",
  active: "未处理",
  processing: "处置中",
  closed: "已关闭",
};

export function formatDistance(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} m`;
}

export function formatRiskType(riskType) {
  return RISK_TYPE_LABELS[riskType] || riskType || "--";
}

export function formatObjectType(type) {
  return OBJECT_TYPE_LABELS[type] || type || "--";
}

export function formatStatus(status) {
  return STATUS_LABELS[status] || status || "--";
}

export function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (Array.isArray(value)) {
    return value.join("、");
  }

  return String(value);
}
