export const workingFaces = [
  {
    id: "wf-3101",
    code: "WF-3101",
    name: "3101回采工作面",
    type: "working_face",
    coalSeamId: "coal-003",
    status: "mining",
    boundary: [
      [-180, 38, -20],
      [120, 38, -20],
      [120, 38, -100],
      [-180, 38, -100],
    ],
    advanceDirection: [1, 0, 0],
    currentAdvance: 80,
    plannedAdvance: 300,
    riskLevel: "high",
    visible: true,
    properties: {
      length: 300,
      width: 80,
      monthlyAdvance: 35,
      startDate: "2026-01",
      endDate: "2026-10",
    },
  },
];
