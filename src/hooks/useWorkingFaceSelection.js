import { useCallback, useMemo, useState } from "react";

function getDefaultWorkingFaceId(workingFaces) {
  return (
    workingFaces.find(
      (face) => face.stage === "active" || face.status === "mining"
    )?.id ||
    workingFaces[0]?.id ||
    ""
  );
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getAdvancePercent(current, planned) {
  if (!planned || planned <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / planned) * 100)));
}

function buildSelectedWorkingFaceObject(face, advanceDistance) {
  if (!face) {
    return null;
  }

  const currentAdvance = toFiniteNumber(
    advanceDistance,
    face.currentAdvance || 0
  );
  const plannedAdvance = toFiniteNumber(
    face.plannedAdvance ?? face.metrics?.plannedAdvance,
    0
  );
  const advancePercent = getAdvancePercent(currentAdvance, plannedAdvance);

  return {
    ...face,
    currentAdvance,
    advancePercent,
    metrics: {
      ...(face.metrics || {}),
      currentAdvance,
      advancePercent,
    },
  };
}

export function useWorkingFaceSelection({
  workingFaces = [],
  selectedObject,
  setSelectedObject,
  onRiskSelectionClear,
}) {
  const defaultWorkingFaceId = getDefaultWorkingFaceId(workingFaces);
  const [advanceDistance, setAdvanceDistance] = useState(
    workingFaces.find((face) => face.id === defaultWorkingFaceId)
      ?.currentAdvance || 0
  );
  const [hasAdvanceDistanceOverride, setHasAdvanceDistanceOverride] = useState(
    Boolean(defaultWorkingFaceId)
  );
  const [selectedWorkingFaceIdState, setSelectedWorkingFaceId] = useState(
    defaultWorkingFaceId
  );
  const selectedWorkingFaceId =
    selectedWorkingFaceIdState || defaultWorkingFaceId;

  const selectedSceneWorkingFaceId =
    selectedObject?.type === "working_face" ? selectedObject.id : "";
  const selectedWorkingFace = useMemo(() => {
    const sceneSelectedWorkingFace = selectedSceneWorkingFaceId
      ? workingFaces.find((face) => face.id === selectedSceneWorkingFaceId)
      : null;

    return (
      sceneSelectedWorkingFace ||
      workingFaces.find((face) => face.id === selectedWorkingFaceId) ||
      workingFaces.find(
        (face) => face.stage === "active" || face.status === "mining"
      ) ||
      workingFaces[0] ||
      null
    );
  }, [selectedSceneWorkingFaceId, selectedWorkingFaceId, workingFaces]);

  const handleWorkingFaceChange = useCallback(
    (workingFaceId) => {
      const nextWorkingFace = workingFaces.find(
        (face) => face.id === workingFaceId
      );

      setSelectedWorkingFaceId(workingFaceId);
      onRiskSelectionClear?.();
      setHasAdvanceDistanceOverride(true);
      setAdvanceDistance(nextWorkingFace?.currentAdvance || 0);

      if (nextWorkingFace) {
        setSelectedObject(
          buildSelectedWorkingFaceObject(
            nextWorkingFace,
            nextWorkingFace.currentAdvance || 0
          )
        );
      }
    },
    [onRiskSelectionClear, setSelectedObject, workingFaces]
  );

  const handleAdvanceChange = useCallback((valueOrUpdater) => {
    setHasAdvanceDistanceOverride(true);
    setAdvanceDistance((prev) => {
      const next =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(prev)
          : Number(valueOrUpdater);

      return Number.isFinite(next) ? next : prev;
    });
  }, []);

  const handleSceneWorkingFaceSelect = useCallback(
    (workingFace) => {
      if (!workingFace?.id) {
        return;
      }

      setSelectedWorkingFaceId(workingFace.id);
      onRiskSelectionClear?.();
      setHasAdvanceDistanceOverride(true);
      setAdvanceDistance(toFiniteNumber(workingFace.currentAdvance, 0));
    },
    [onRiskSelectionClear]
  );
  const setResolvedAdvanceDistance = useCallback((valueOrUpdater) => {
    setHasAdvanceDistanceOverride(true);
    setAdvanceDistance(valueOrUpdater);
  }, []);
  const resolvedAdvanceDistance =
    hasAdvanceDistanceOverride
      ? advanceDistance
      : workingFaces.find((face) => face.id === defaultWorkingFaceId)
          ?.currentAdvance || 0;

  return {
    selectedWorkingFace,
    selectedWorkingFaceId,
    advanceDistance: resolvedAdvanceDistance,
    setSelectedWorkingFaceId,
    setAdvanceDistance: setResolvedAdvanceDistance,
    handleWorkingFaceChange,
    handleAdvanceChange,
    handleSceneWorkingFaceSelect,
  };
}
