import { useSceneStore } from "../../store/sceneStore";
import {
  formatObjectType,
  formatRiskType,
  formatStatus,
  formatValue,
} from "../../utils/formatters";
import { getRiskLevelColor, getRiskLevelLabel } from "../../utils/riskLevel";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[12px] leading-5">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{formatValue(value)}</span>
    </div>
  );
}

export default function InfoPanel({ coalSeams = [] }) {
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const clearSelectedObject = useSceneStore((state) => state.clearSelectedObject);

  if (!selectedObject) {
    return (
      <section className="fixed right-5 top-5 z-20 w-[340px] border border-white/10 bg-slate-950/82 p-4 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
        <div className="text-sm font-semibold text-cyan-100">对象属性</div>
        <div className="mt-4 text-sm text-slate-400">
          请选择三维对象查看详情
        </div>
      </section>
    );
  }

  const coalSeam = coalSeams.find((item) => item.id === selectedObject.coalSeamId);
  const properties = selectedObject.properties || {};

  return (
    <section className="fixed right-5 top-5 z-20 max-h-[45vh] w-[340px] overflow-auto border border-white/10 bg-slate-950/86 p-4 text-slate-100 shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:hidden">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-cyan-100">对象属性</div>
          <div className="mt-1 text-base font-semibold">{selectedObject.name}</div>
        </div>
        <button
          className="cursor-pointer border border-white/10 px-2 py-1 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100"
          onClick={clearSelectedObject}
        >
          清除
        </button>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
        <InfoRow label="类型" value={formatObjectType(selectedObject.type)} />
        <InfoRow label="编号" value={selectedObject.code || selectedObject.id} />

        {selectedObject.riskLevel && (
          <div className="flex items-center justify-between gap-4 text-[12px] leading-5">
            <span className="text-slate-500">风险等级</span>
            <span
              className="font-semibold"
              style={{ color: getRiskLevelColor(selectedObject.riskLevel) }}
            >
              {getRiskLevelLabel(selectedObject.riskLevel)}
            </span>
          </div>
        )}

        {selectedObject.riskType && (
          <InfoRow label="风险类型" value={formatRiskType(selectedObject.riskType)} />
        )}
        {selectedObject.influenceRadius && (
          <InfoRow label="影响半径" value={`${selectedObject.influenceRadius} m`} />
        )}

        {selectedObject.type === "working_face" && (
          <>
            <InfoRow label="推进距离" value={`${selectedObject.currentAdvance} m`} />
            <InfoRow label="所属煤层" value={coalSeam?.name || selectedObject.coalSeamId} />
            <InfoRow label="状态" value={formatStatus(selectedObject.status)} />
          </>
        )}

        {Object.entries(properties).map(([key, value]) => (
          <InfoRow key={key} label={key} value={value} />
        ))}
      </div>
    </section>
  );
}
