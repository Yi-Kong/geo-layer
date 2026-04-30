# AGENTS.md

## 项目概述

本仓库为 `geo-layer`。

该项目是一个用于 **三维地质层可视化** 的前端原型。它旨在作为透明地质系统的可视化基础，并在后续阶段作为煤矿预警场景中的三维可视化模块。

当前定位：

- 这是一个 React + Vite 前端项目。
- 三维场景通过 React Three Fiber 使用 Three.js 实现。
- 地质层数据当前从静态 JSON 数据中加载。
- 当前重点是实现地质层的三维半透明分层显示。
- 本项目目前还不是一个完整的透明地质系统。
- 本项目目前还不是一个完整的煤矿安全预警系统。
- 除非任务明确要求，否则不要添加后端、数据库、机器学习或实时预警逻辑。

当前目标是保持项目轻量、易理解，并适合逐步迭代开发。

---

## 当前开发重点

当前阶段的核心任务是：

> 基于当前 React Three Fiber 项目，实现地质层半透明分层显示。

开发时可以重点参考以下 Codex skills：

- `threejs-geometry`
- `threejs-materials`

这些 skills 只能作为 Three.js 几何体和材质实现的开发参考，不应改变项目的技术路线。

实现时应遵守以下约束：

- 不要将项目改成原生 Three.js 初始化方式。
- 不要手写 `scene` / `camera` / `renderer` 初始化代码。
- 不要手写独立的 `requestAnimationFrame` 主渲染循环。
- 必须保持 React Three Fiber 写法。
- 三维场景应继续由 `<Canvas>` 管理。
- 动画逻辑如有需要，应使用 React Three Fiber 的 `useFrame`。
- 交互逻辑如有需要，应优先使用 React Three Fiber 的事件系统，例如 `onPointerOver`、`onPointerOut`、`onClick`。
- 数据继续来自 `public/data/geology-layers.json`。
- 不要引入后端、数据库、机器学习或实时预警逻辑。

---

## 业务背景

本项目应被视为一个 **三维地质可视化原型**。

后续该项目可能演进为更大系统的一部分，包含以下模块：

1. 地质层可视化
2. 煤层可视化
3. 断层可视化
4. 巷道 / 隧道可视化
5. 钻孔可视化
6. 工作面可视化
7. 传感器点位可视化
8. 瓦斯 / 水害 / 压力预警叠加显示
9. 预警事件展示
10. 历史预警回放

但当前仓库应主要聚焦于前端三维可视化。

添加功能时，需要保持系统边界清晰：

- 前端：允许在本仓库中实现
- 静态演示数据：允许
- Mock API 结构：允许
- 后端实现：仅在明确要求时添加
- 数据库实现：仅在明确要求时添加
- 预测模型实现：仅在明确要求时添加
- 实时预警逻辑：仅在明确要求时添加

---

## 技术栈

除非用户明确要求更改，否则应使用现有技术栈。

主要技术：

- React
- Vite
- JavaScript / JSX
- Three.js
- @react-three/fiber
- @react-three/drei
- CSS

技术约束：

- 不要迁移到 TypeScript，除非明确要求。
- 不要用原生 Three.js 替换 React Three Fiber，除非明确要求。
- 不要引入 Unity、Cesium、Babylon.js、Unreal 等重型三维引擎，除非明确要求且有充分理由。
- 不要引入复杂状态管理库，除非当前功能确实需要。
- 不要引入后端框架。
- 不要引入数据库。
- 不要引入机器学习、预测模型或实时告警引擎。

---

## React Three Fiber 开发规则

本项目必须保持 React Three Fiber 风格。

允许：

- 使用 `<Canvas>` 创建三维场景。
- 使用 R3F 组件化方式组织 Mesh、材质、光照、控制器。
- 使用 `@react-three/drei` 中的轻量辅助组件。
- 使用 `useFrame` 实现必要的动画。
- 使用 R3F 指针事件实现交互。
- 使用 Three.js 的几何体、材质、颜色、向量、BufferGeometry 等底层能力。

不允许，除非任务明确要求：

- 手动创建 `new THREE.Scene()` 作为主场景。
- 手动创建 `new THREE.WebGLRenderer()` 作为主渲染器。
- 手动创建独立的主渲染循环替代 R3F。
- 在 React 生命周期外直接长期操作 DOM canvas。
- 绕过 R3F 组件体系重写整个三维场景。

如果参考 Three.js 原生示例，必须将其转换为 React Three Fiber 写法。

---

## Codex Skills 使用说明

本项目可以使用 Codex skills 辅助开发。

推荐的 skills 存放路径：

```text
.agents/
└── skills/
    ├── threejs-geometry/
    │   └── SKILL.md
    ├── threejs-materials/
    │   └── SKILL.md
    ├── threejs-lighting/
    │   └── SKILL.md
    ├── threejs-interaction/
    │   └── SKILL.md
    └── ...