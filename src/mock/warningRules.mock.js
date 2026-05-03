import { riskTypeMeta } from "./riskMeta.js";

const ruleSuggestions = {
  goaf_water: {
    medium: "开展超前探测，复核老空区边界。",
    high: "布置探放水钻孔，控制推进速度。",
    critical: "暂停受威胁区域作业，优先执行探放水和防水煤柱复核。",
  },
  water_inrush: {
    medium: "补充水文孔资料，关注底板水压变化。",
    high: "开展疏水降压和底板完整性复核。",
    critical: "启动注浆加固方案，限制工作面继续接近异常区。",
  },
  gas: {
    medium: "加强瓦斯巡检，复核抽采达标情况。",
    high: "加密抽采钻孔，提升通风与抽采联动监测。",
    critical: "优先执行区域预抽和卸压增透，确认达标后推进。",
  },
  soft_layer: {
    medium: "复核软分层分布和瓦斯异常叠加关系。",
    high: "优化抽采钻孔布置，加强掘进期间瓦斯监测。",
    critical: "暂停接近区域作业，完成软分层和突出风险专项复核。",
  },
  small_mine_damage: {
    medium: "开展超前物探和资料复核，控制接近距离。",
    high: "补充钻探验证小窑破坏区边界，编制专项治理措施。",
    critical: "暂停接近区域作业，先行完成边界核查和隐患治理。",
  },
  goaf: {
    medium: "复核采空区边界，分析与工作面空间关系。",
    high: "开展隐蔽致灾因素排查，控制采掘接近距离。",
    critical: "暂停受威胁区域作业，优先采取超前治理措施。",
  },
  abandoned_shaft: {
    medium: "核查废弃井筒封闭资料，评估导水风险。",
    high: "采掘接近前进行专项探查，必要时实施封堵复核。",
    critical: "暂停接近区域作业，优先完成井筒封闭和注浆治理。",
  },
  poor_sealed_borehole: {
    medium: "复核钻孔封闭质量和空间位置。",
    high: "分析钻孔导水可能性，采掘接近前加强探查。",
    critical: "暂停接近区域作业，必要时重新封孔或注浆。",
  },
  fault_influence: {
    medium: "复核断层位置、落差和导水性。",
    high: "开展超前探测，论证注浆加固或采掘方案调整。",
    critical: "暂停接近破碎带作业，先行完成专项探查和治理。",
  },
};

function createDistanceRule(riskType) {
  const meta = riskTypeMeta[riskType];
  const rules = meta?.warningRules || {};
  const suggestions = ruleSuggestions[riskType] || {};

  return {
    id: `rule-${riskType.replaceAll("_", "-")}`,
    riskType,
    name: `${meta?.label || riskType}距离预警`,
    levels: [
      {
        level: "none",
        minDistance: rules.mediumDistance,
        maxDistance: Infinity,
        label: "无预警",
        color: "#22c55e",
        suggestion: "维持常规巡检与资料复核。",
      },
      {
        level: "medium",
        minDistance: rules.highDistance,
        maxDistance: rules.mediumDistance,
        label: "一般预警",
        color: "#facc15",
        suggestion: suggestions.medium || "开展超前探测并复核风险体边界。",
      },
      {
        level: "high",
        minDistance: rules.criticalDistance,
        maxDistance: rules.highDistance,
        label: "较大预警",
        color: "#f97316",
        suggestion: suggestions.high || "控制推进速度，落实专项治理措施。",
      },
      {
        level: "critical",
        minDistance: 0,
        maxDistance: rules.criticalDistance,
        label: "严重预警",
        color: "#ef4444",
        suggestion: suggestions.critical || "暂停受威胁区域作业，优先治理。",
      },
    ],
  };
}

export const warningRules = [
  "goaf_water",
  "water_inrush",
  "gas",
  "soft_layer",
  "small_mine_damage",
  "goaf",
  "abandoned_shaft",
  "poor_sealed_borehole",
  "fault_influence",
].map((riskType) => createDistanceRule(riskType));
