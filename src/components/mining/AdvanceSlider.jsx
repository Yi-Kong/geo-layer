import { useEffect, useMemo, useRef, useState } from "react";

const SPEED_OPTIONS = [
  { value: 1, label: "慢速", description: "1 m / tick" },
  { value: 5, label: "中速", description: "5 m / tick" },
  { value: 10, label: "快速", description: "10 m / tick" },
];

function getDefaultWorkingFaceId(workingFaces) {
  return (
    workingFaces.find(
      (face) => face.status === "mining" || face.stage === "active"
    )?.id ||
    workingFaces[0]?.id ||
    ""
  );
}

function getAdvancePercent(current, planned) {
  if (!planned || planned <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / planned) * 100)));
}

function getSafeNumber(value, fallback = 0) {
  const next = Number(value);

  return Number.isFinite(next) ? next : fallback;
}

export default function AdvanceSlider({
  workingFace,
  workingFaces = [],
  selectedWorkingFaceId,
  advanceDistance,
  onWorkingFaceChange,
  onAdvanceChange,
}) {
  const faceList = useMemo(
    () =>
      workingFaces.length > 0
        ? workingFaces
        : workingFace
          ? [workingFace]
          : [],
    [workingFace, workingFaces]
  );
  const defaultWorkingFaceId = useMemo(
    () => getDefaultWorkingFaceId(faceList),
    [faceList]
  );
  const [localWorkingFaceId, setLocalWorkingFaceId] = useState(
    defaultWorkingFaceId
  );
  const [playing, setPlaying] = useState(false);
  const [playingWorkingFaceId, setPlayingWorkingFaceId] = useState("");
  const [speed, setSpeed] = useState(5);

  const hasLocalWorkingFace = faceList.some(
    (face) => face.id === localWorkingFaceId
  );
  const activeWorkingFaceId =
    selectedWorkingFaceId ||
    (hasLocalWorkingFace ? localWorkingFaceId : defaultWorkingFaceId);
  const selectedFace =
    faceList.find((face) => face.id === activeWorkingFaceId) ||
    faceList.find((face) => face.id === defaultWorkingFaceId) ||
    faceList[0];
  const hasWorkingFace = Boolean(selectedFace);
  const plannedAdvance = getSafeNumber(selectedFace?.plannedAdvance);
  const currentAdvance = Math.max(0, getSafeNumber(advanceDistance));
  const boundedAdvance =
    plannedAdvance > 0
      ? Math.min(currentAdvance, plannedAdvance)
      : currentAdvance;
  const advancePercent = getAdvancePercent(boundedAdvance, plannedAdvance);
  const remainingAdvance = Math.max(0, plannedAdvance - boundedAdvance);
  const latestAdvanceRef = useRef(boundedAdvance);
  const playingActiveFace =
    playing && playingWorkingFaceId === activeWorkingFaceId;
  const autoAdvancing =
    playingActiveFace &&
    hasWorkingFace &&
    plannedAdvance > 0 &&
    boundedAdvance < plannedAdvance;

  useEffect(() => {
    latestAdvanceRef.current = boundedAdvance;
  }, [boundedAdvance]);

  useEffect(() => {
    if (!autoAdvancing) return undefined;

    const timer = window.setInterval(() => {
      const next = Math.min(plannedAdvance, latestAdvanceRef.current + speed);
      latestAdvanceRef.current = next;
      onAdvanceChange?.(next);

      if (next >= plannedAdvance) {
        setPlaying(false);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [autoAdvancing, onAdvanceChange, plannedAdvance, speed]);

  const statusLabel = !hasWorkingFace
    ? "暂无工作面"
    : autoAdvancing
      ? "自动推进中"
      : boundedAdvance >= plannedAdvance
        ? "已推进完成"
        : "手动调整";

  function handleAdvanceChange(event) {
    const next = Number(event.target.value);
    latestAdvanceRef.current = next;
    onAdvanceChange?.(next);
  }

  function handleWorkingFaceChange(event) {
    const nextWorkingFaceId = event.target.value;
    const nextWorkingFace = faceList.find(
      (face) => face.id === nextWorkingFaceId
    );

    setPlaying(false);
    setPlayingWorkingFaceId("");
    setLocalWorkingFaceId(nextWorkingFaceId);
    onWorkingFaceChange?.(nextWorkingFaceId);
    onAdvanceChange?.(nextWorkingFace?.currentAdvance || 0);
  }

  function handlePlay() {
    if (!hasWorkingFace || boundedAdvance >= plannedAdvance) return;

    setPlaying(true);
    setPlayingWorkingFaceId(activeWorkingFaceId);
  }

  function handlePause() {
    setPlaying(false);
    setPlayingWorkingFaceId("");
  }

  function handleReset() {
    const resetAdvance = getSafeNumber(selectedFace?.currentAdvance);

    latestAdvanceRef.current = resetAdvance;
    setPlaying(false);
    setPlayingWorkingFaceId("");
    onAdvanceChange?.(resetAdvance);
  }

  function handleSpeedChange(event) {
    setSpeed(Number(event.target.value));
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-20 w-[min(760px,calc(100vw-420px))] -translate-x-1/2 border border-cyan-400/20 bg-slate-950/82 px-5 py-4 text-slate-100 shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-md max-lg:w-[calc(100vw-32px)] max-sm:bottom-4 max-sm:px-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-cyan-100">
          <span className="shrink-0">工作面选择：</span>
          {faceList.length > 1 ? (
            <select
              aria-label="工作面选择"
              className="min-w-0 flex-1 border border-cyan-400/20 bg-slate-900/90 px-2 py-1 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
              value={selectedFace?.id || ""}
              onChange={handleWorkingFaceChange}
            >
              {faceList.map((face) => (
                <option key={face.id} value={face.id}>
                  {face.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="truncate text-slate-100">
              {selectedFace?.name || "暂无工作面"}
            </span>
          )}
        </label>

        <div className="shrink-0 text-sm text-slate-300">
          状态：
          <span className="font-semibold text-cyan-200">{statusLabel}</span>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-slate-300 max-sm:grid-cols-1">
        <div>
          当前推进：
          <span className="font-semibold text-cyan-100">
            {boundedAdvance} m / {plannedAdvance} m
          </span>
        </div>
        <div>
          完成比例：
          <span className="font-semibold text-cyan-100">{advancePercent}%</span>
        </div>
        <div>
          剩余推进：
          <span className="font-semibold text-cyan-100">
            {remainingAdvance} m
          </span>
        </div>
        <label className="flex items-center gap-2">
          <span>速度：</span>
          <select
            aria-label="推进速度"
            className="border border-cyan-400/20 bg-slate-900/90 px-2 py-1 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
            value={speed}
            onChange={handleSpeedChange}
            disabled={!hasWorkingFace}
          >
            {SPEED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}：{option.description}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        className="h-2 w-full cursor-pointer accent-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="工作面推进距离"
        type="range"
        min="0"
        max={plannedAdvance}
        step="1"
        value={boundedAdvance}
        onChange={handleAdvanceChange}
        disabled={!hasWorkingFace}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className="border border-cyan-300/30 bg-cyan-300/12 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:border-slate-600/40 disabled:bg-slate-800/40 disabled:text-slate-500"
          type="button"
          onClick={handlePlay}
          disabled={!hasWorkingFace || autoAdvancing || boundedAdvance >= plannedAdvance}
        >
          播放
        </button>
        <button
          className="border border-slate-500/40 bg-slate-800/70 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:text-slate-500"
          type="button"
          onClick={handlePause}
          disabled={!hasWorkingFace || !autoAdvancing}
        >
          暂停
        </button>
        <button
          className="border border-slate-500/40 bg-slate-800/70 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:text-slate-500"
          type="button"
          onClick={handleReset}
          disabled={!hasWorkingFace}
        >
          重置
        </button>
        <div className="ml-auto text-xs text-slate-500 max-sm:ml-0">
          计划推进 {plannedAdvance} m
        </div>
      </div>
    </div>
  );
}
