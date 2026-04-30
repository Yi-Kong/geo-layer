import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  GizmoHelper,
  GizmoViewport,
  Html,
  OrbitControls,
  useCursor,
} from "@react-three/drei";

/**
 * 如果后续改成后端接口，把这里改成：
 * const LAYER_DATA_URL = "/api/geology/layers";
 */
const LAYER_DATA_URL = "/data/geology-layers.json";

/**
 * 构造地质块体边界
 */
function createFootprint(width = 8, depth = 4.6, segment = 22) {
  const pts = [];
  const halfW = width / 2;
  const halfD = depth / 2;

  for (let i = 0; i <= segment; i++) {
    const t = i / segment;
    const x = -halfW + width * t;
    const z =
      -halfD +
      0.18 * Math.sin(t * Math.PI * 3) +
      0.08 * Math.sin(t * Math.PI * 9);

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i <= segment; i++) {
    const t = i / segment;
    const x = halfW + 0.04 * Math.sin(t * Math.PI * 4);
    const z = -halfD + depth * t;

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i <= segment; i++) {
    const t = i / segment;
    const x = halfW - width * t;
    const z = halfD + 0.04 * Math.sin(t * Math.PI * 5);

    pts.push(new THREE.Vector2(x, z));
  }

  for (let i = 1; i < segment; i++) {
    const t = i / segment;
    const x =
      -halfW +
      0.14 * Math.sin(t * Math.PI * 2) +
      0.06 * Math.sin(t * Math.PI * 8);
    const z = halfD - depth * t;

    pts.push(new THREE.Vector2(x, z));
  }

  return pts;
}

/**
 * 创建顶面 / 底面
 */
function createCapGeometry(points, y, reverse = false) {
  const positions = [];

  let centerX = 0;
  let centerZ = 0;

  points.forEach((p) => {
    centerX += p.x;
    centerZ += p.y;
  });

  centerX /= points.length;
  centerZ /= points.length;

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    if (!reverse) {
      positions.push(centerX, y, centerZ);
      positions.push(p1.x, y, p1.y);
      positions.push(p2.x, y, p2.y);
    } else {
      positions.push(centerX, y, centerZ);
      positions.push(p2.x, y, p2.y);
      positions.push(p1.x, y, p1.y);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * 创建地层侧面
 */
function createSideGeometry(points, yTop, yBottom) {
  const positions = [];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    positions.push(p1.x, yTop, p1.y);
    positions.push(p1.x, yBottom, p1.y);
    positions.push(p2.x, yBottom, p2.y);

    positions.push(p1.x, yTop, p1.y);
    positions.push(p2.x, yBottom, p2.y);
    positions.push(p2.x, yTop, p2.y);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * 创建地层边界线
 */
function createOutlineGeometry(points, y) {
  const positions = [];

  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    positions.push(p1.x, y, p1.y);
    positions.push(p2.x, y, p2.y);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  return geometry;
}

/**
 * 创建顶部不规则斑块
 */
function createBlobGeometry(cx, cz, y, rx, rz, count = 20, seed = 1) {
  const positions = [];
  const center = new THREE.Vector3(cx, y, cz);

  const randomLike = (i) =>
    0.78 +
    0.24 *
      Math.sin(i * 12.9898 + seed * 78.233) *
      Math.sin(i * 4.123 + seed * 17.17);

  const pts = [];

  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const r = randomLike(i);

    const x = cx + Math.cos(a) * rx * r;
    const z = cz + Math.sin(a) * rz * r;

    pts.push(new THREE.Vector3(x, y, z));
  }

  for (let i = 0; i < count; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % count];

    positions.push(center.x, center.y, center.z);
    positions.push(p1.x, p1.y, p1.z);
    positions.push(p2.x, p2.y, p2.z);
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.computeVertexNormals();

  return geometry;
}

function BlobPatch({ cx, cz, y, rx, rz, seed }) {
  const geometry = useMemo(
    () => createBlobGeometry(cx, cz, y, rx, rz, 24, seed),
    [cx, cz, y, rx, rz, seed]
  );

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#82b2c0"
        roughness={0.95}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * 颜色加亮
 */
function lightenColor(hex, amount = 0.1) {
  const color = new THREE.Color(hex);

  color.r = Math.min(1, color.r + amount);
  color.g = Math.min(1, color.g + amount);
  color.b = Math.min(1, color.b + amount);

  return `#${color.getHexString()}`;
}

/**
 * 颜色变暗
 */
function darkenColor(hex, amount = 0.1) {
  const color = new THREE.Color(hex);

  color.r = Math.max(0, color.r - amount);
  color.g = Math.max(0, color.g - amount);
  color.b = Math.max(0, color.b - amount);

  return `#${color.getHexString()}`;
}

/**
 * 单个地层
 */
function GeologicalLayer({
  layer,
  totalLayers,
  points,
  explode,
  selected,
  onSelect,
}) {
  const [hovered, setHovered] = useState(false);

  useCursor(hovered);

  const gap = 0.28 * explode;

  /**
   * 越靠上的地层，拆分后抬得越高
   */
  const offsetY = gap * (totalLayers - 1 - layer.index);

  const middleY = (layer.yTop + layer.yBottom) / 2;

  const topGeometry = useMemo(
    () => createCapGeometry(points, layer.yTop, false),
    [points, layer.yTop]
  );

  const bottomGeometry = useMemo(
    () => createCapGeometry(points, layer.yBottom, true),
    [points, layer.yBottom]
  );

  const sideGeometry = useMemo(
    () => createSideGeometry(points, layer.yTop, layer.yBottom),
    [points, layer.yTop, layer.yBottom]
  );

  const topOutline = useMemo(
    () => createOutlineGeometry(points, layer.yTop + 0.001),
    [points, layer.yTop]
  );

  const bottomOutline = useMemo(
    () => createOutlineGeometry(points, layer.yBottom - 0.001),
    [points, layer.yBottom]
  );

  return (
    <group position={[0, offsetY, 0]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(layer.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      >
        <mesh geometry={sideGeometry}>
          <meshStandardMaterial
            color={selected ? lightenColor(layer.color, 0.12) : layer.color}
            roughness={0.9}
            metalness={0.03}
            transparent
            opacity={selected ? 1 : 0.94}
            emissive={selected ? "#ffffff" : "#000000"}
            emissiveIntensity={selected ? 0.12 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={topGeometry}>
          <meshStandardMaterial
            color={selected ? lightenColor(layer.color, 0.18) : layer.color}
            roughness={0.82}
            metalness={0.02}
            emissive={selected ? "#ffffff" : "#000000"}
            emissiveIntensity={selected ? 0.08 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={bottomGeometry}>
          <meshStandardMaterial
            color={darkenColor(layer.color, 0.12)}
            roughness={0.92}
            metalness={0.01}
            side={THREE.DoubleSide}
          />
        </mesh>

        <lineSegments geometry={topOutline}>
          <lineBasicMaterial color={selected ? "#ffe8a3" : "#1f6581"} />
        </lineSegments>

        <lineSegments geometry={bottomOutline}>
          <lineBasicMaterial color={selected ? "#ffd16b" : "#d17c39"} />
        </lineSegments>

        {hovered && (
          <Html
            position={[4.45, middleY, 0]}
            center
            distanceFactor={8}
            transform={false}
          >
            <div className="hover-tooltip">
              <div className="tooltip-title">{layer.name}</div>
              <div>岩性：{layer.lithology}</div>
              <div>厚度：{Number(layer.thickness).toFixed(2)} m</div>
              <div>渗透性：{layer.permeability}</div>
            </div>
          </Html>
        )}

        {explode > 0.12 && (
          <Html
            position={[0, layer.yTop + 0.03, 0]}
            center
            distanceFactor={8}
            transform={false}
          >
            <div className={`layer-tag ${selected ? "active" : ""}`}>
              {layer.name}
            </div>
          </Html>
        )}
      </group>

      {layer.index === 0 && (
        <>
          <BlobPatch
            cx={1.6}
            cz={1.1}
            y={layer.yTop + 0.025}
            rx={0.95}
            rz={0.32}
            seed={1}
          />
          <BlobPatch
            cx={2.25}
            cz={1.1}
            y={layer.yTop + 0.028}
            rx={0.7}
            rz={0.23}
            seed={2}
          />
          <BlobPatch
            cx={-1.55}
            cz={-0.65}
            y={layer.yTop + 0.03}
            rx={0.7}
            rz={0.38}
            seed={3}
          />
          <BlobPatch
            cx={-0.55}
            cz={-0.25}
            y={layer.yTop + 0.028}
            rx={0.28}
            rz={0.18}
            seed={4}
          />
          <BlobPatch
            cx={0.6}
            cz={-1.2}
            y={layer.yTop + 0.028}
            rx={0.35}
            rz={0.28}
            seed={5}
          />
        </>
      )}
    </group>
  );
}

/**
 * 地质模型
 */
function GeologicalModel({
  layerData,
  visibleLayerIds,
  explode,
  selectedLayerId,
  setSelectedLayerId,
}) {
  const points = useMemo(() => createFootprint(8, 4.6, 22), []);

  const layers = useMemo(() => {
    const totalThickness = layerData.reduce(
      (sum, layer) => sum + Number(layer.thickness || 0),
      0
    );

    let currentY = totalThickness / 2;

    return layerData.map((layer, index) => {
      const thickness = Number(layer.thickness || 0.1);
      const yTop = currentY;
      const yBottom = currentY - thickness;

      currentY = yBottom;

      return {
        ...layer,
        index,
        thickness,
        yTop,
        yBottom,
      };
    });
  }, [layerData]);

  return (
    <group rotation={[0, -0.22, 0]}>
      {layers
        .filter((layer) => visibleLayerIds.has(layer.id))
        .map((layer) => (
          <GeologicalLayer
            key={layer.id}
            layer={layer}
            totalLayers={layers.length}
            points={points}
            explode={explode}
            selected={selectedLayerId === layer.id}
            onSelect={setSelectedLayerId}
          />
        ))}
    </group>
  );
}

/**
 * 主组件
 */
export default function App() {
  const [layerData, setLayerData] = useState([]);
  const [visibleLayerIds, setVisibleLayerIds] = useState(new Set());
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [explode, setExplode] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLayerData() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(LAYER_DATA_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`地层数据加载失败：${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("地层数据格式错误：根节点必须是数组。");
        }

        setLayerData(data);
        setVisibleLayerIds(new Set(data.map((item) => item.id)));
        setSelectedLayerId(data[0]?.id ?? null);
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(error.message || "地层数据加载失败");
        }
      } finally {
        setLoading(false);
      }
    }

    loadLayerData();

    return () => {
      controller.abort();
    };
  }, []);

  const selectedLayer = useMemo(() => {
    return layerData.find((layer) => layer.id === selectedLayerId) ?? null;
  }, [layerData, selectedLayerId]);

  function toggleLayerVisible(layerId) {
    const next = new Set(visibleLayerIds);

    if (next.has(layerId)) {
      next.delete(layerId);
    } else {
      next.add(layerId);
    }

    setVisibleLayerIds(next);

    if (selectedLayerId === layerId && !next.has(layerId)) {
      const nextSelected = layerData.find((layer) => next.has(layer.id));
      setSelectedLayerId(nextSelected?.id ?? null);
    }
  }

  function showAllLayers() {
    setVisibleLayerIds(new Set(layerData.map((layer) => layer.id)));

    if (!selectedLayerId && layerData.length > 0) {
      setSelectedLayerId(layerData[0].id);
    }
  }

  function hideAllLayers() {
    setVisibleLayerIds(new Set());
    setSelectedLayerId(null);
  }

  return (
    <div className="page">
      <Canvas
        camera={{ position: [6.4, 4.2, 6.2], fov: 38, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f4f1eb"]} />

        <ambientLight intensity={1.45} />
        <directionalLight position={[5, 8, 6]} intensity={2.1} />
        <directionalLight position={[-4, 5, -3]} intensity={0.6} />

        <Center>
          {!loading && !loadError && layerData.length > 0 && (
            <GeologicalModel
              layerData={layerData}
              visibleLayerIds={visibleLayerIds}
              explode={explode}
              selectedLayerId={selectedLayerId}
              setSelectedLayerId={setSelectedLayerId}
            />
          )}
        </Center>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={16}
        />

        <GizmoHelper alignment="bottom-left" margin={[70, 70]}>
          <GizmoViewport
            axisColors={["#e8593f", "#4caf50", "#3f51e8"]}
            labelColor="black"
          />
        </GizmoHelper>
      </Canvas>

      <div className="panel">
        <div className="panel-title">地质层控制面板</div>

        {loading && <div className="state-text">正在加载地层数据...</div>}

        {loadError && <div className="error-text">{loadError}</div>}

        {!loading && !loadError && (
          <>
            <div className="control-row">
              <label className="control-label">拆分程度</label>
              <div className="slider-value">{explode.toFixed(2)}</div>
            </div>

            <input
              className="slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explode}
              onChange={(e) => setExplode(Number(e.target.value))}
            />

            <div className="hint">
              拖动滑块可拆分地质层；鼠标悬停在某层上可查看简要信息；点击某层可查看详细信息。
            </div>

            <div className="divider" />

            <div className="panel-subtitle">地层显示 / 隐藏</div>

            <div className="button-row">
              <button className="small-btn" onClick={showAllLayers}>
                全部显示
              </button>
              <button className="small-btn" onClick={hideAllLayers}>
                全部隐藏
              </button>
            </div>

            <div className="layer-list">
              {layerData.map((layer) => {
                const visible = visibleLayerIds.has(layer.id);
                const selected = selectedLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    className={`layer-list-item ${
                      selected ? "active" : ""
                    } ${visible ? "" : "hidden-layer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={() => toggleLayerVisible(layer.id)}
                    />

                    <button
                      className="layer-select-button"
                      disabled={!visible}
                      onClick={() => setSelectedLayerId(layer.id)}
                    >
                      <span
                        className="color-dot small"
                        style={{ background: layer.color }}
                      />
                      <span>{layer.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            <div className="panel-subtitle">当前选中地层</div>

            {!selectedLayer && (
              <div className="state-text">当前没有选中任何地层。</div>
            )}

            {selectedLayer && (
              <>
                <div className="layer-header">
                  <span
                    className="color-dot"
                    style={{ background: selectedLayer.color }}
                  />
                  <span className="layer-name">{selectedLayer.name}</span>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span className="info-key">层号</span>
                    <span className="info-value">{selectedLayer.id}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-key">岩性</span>
                    <span className="info-value">{selectedLayer.lithology}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-key">时代</span>
                    <span className="info-value">{selectedLayer.age}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-key">厚度</span>
                    <span className="info-value">
                      {Number(selectedLayer.thickness).toFixed(2)} m
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-key">孔隙性</span>
                    <span className="info-value">{selectedLayer.porosity}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-key">渗透性</span>
                    <span className="info-value">
                      {selectedLayer.permeability}
                    </span>
                  </div>

                  <div className="info-item column">
                    <span className="info-key">说明</span>
                    <span className="info-value">
                      {selectedLayer.description}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}