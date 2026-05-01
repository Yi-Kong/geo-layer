export default function AdvanceSlider({
  workingFace,
  advanceDistance,
  onAdvanceChange,
}) {
  if (!workingFace) {
    return null;
  }

  function handleAdvanceChange(event) {
    onAdvanceChange(Number(event.target.value));
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-20 w-[min(720px,calc(100vw-420px))] -translate-x-1/2 border border-cyan-400/20 bg-slate-950/82 px-5 py-4 text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:w-[calc(100vw-32px)]">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-cyan-100">
            {workingFace.name}推进模拟
          </div>
          <div className="mt-1 text-xs text-slate-400">
            计划推进 {workingFace.plannedAdvance} m
          </div>
        </div>
        <div className="min-w-[96px] text-right text-2xl font-semibold text-cyan-200">
          {advanceDistance}
          <span className="ml-1 text-sm text-slate-400">m</span>
        </div>
      </div>

      <input
        className="h-2 w-full cursor-pointer accent-cyan-300"
        type="range"
        min="0"
        max={workingFace.plannedAdvance}
        step="1"
        value={advanceDistance}
        onChange={handleAdvanceChange}
        onInput={handleAdvanceChange}
      />
    </div>
  );
}
