export const RISK_LEVELS = {
  NONE: "none",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const RISK_LEVEL_LABELS = {
  none: "无风险",
  low: "低风险",
  medium: "一般预警",
  high: "较大预警",
  critical: "严重预警",
};

export const RISK_LEVEL_COLORS = {
  none: "#22c55e",
  low: "#2A9D8F",
  medium: "#E9C46A",
  high: "#F4A261",
  critical: "#E63946",
};

export function getRiskLevelColor(level) {
  return RISK_LEVEL_COLORS[level] || "#94a3b8";
}

export function getRiskLevelLabel(level) {
  return RISK_LEVEL_LABELS[level] || "未知";
}
