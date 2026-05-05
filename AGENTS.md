# AGENTS.md

## 项目定位

本仓库是 `geo-layer-demo`，一个基于 React + Vite + React Three Fiber 的三维地质可视化前端原型。

当前项目已经从单纯的地质分层演示扩展为一个轻量的透明地质 / 矿山安全场景前端 demo，包含：

- 三维地层、煤层、断层、陷落柱、钻孔等地质对象展示。
- 巷道、采掘工作面、推进距离等生产对象展示。
- 含水层、采空积水区、富水区、突水点等水文对象展示。
- 瓦斯富集区、瓦斯含量 / 压力测点、软弱层等瓦斯对象展示。
- 隐蔽致灾体、风险范围、治理措施点、预警点位和前端生成的预警提示。
- 图层分组、显隐、透明度控制、对象选择和信息面板。

项目边界仍然是 **前端三维可视化原型**。除非用户明确要求，不要把它扩展成完整后端系统、真实透明地质平台、真实煤矿安全预警系统或生产级数据平台。

## 当前重点

开发时优先维护以下目标：

- 保持三维场景清晰、稳定、可交互。
- 保持图层和业务对象由 mock/API 数据驱动，不把数据散落硬编码在组件里。
- 保持 React Three Fiber 组件化写法，继续由 `<Canvas>` 管理场景。
- 保持前端原型轻量，避免引入重型 GIS、后端、数据库、实时消息或机器学习能力。
- 在已有模块上小步迭代，避免无关重构和技术栈迁移。

当前代码已经包含较多 mock 业务对象。新增能力时，应优先判断它是：

1. 前端 mock 展示；
2. API 适配层扩展；
3. 真实业务系统能力。

如果用户没有明确要求真实对接或真实算法，默认只做前端 mock 展示和清晰的数据适配。

## 技术栈

使用现有技术栈，不要主动迁移：

- React 19
- Vite 8
- JavaScript / JSX
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@tanstack/react-router`
- Zustand
- Tailwind CSS 4 + 普通 CSS
- MSW mock API
- Bun

约束：

- 不要迁移到 TypeScript，除非用户明确要求。
- 不要把 React Three Fiber 改成原生 Three.js 主循环。
- 不要引入 `react-router-dom`。
- 不要把 Zustand 替换成 Redux、MobX 或其他状态库。
- 不要引入 Cesium、Babylon.js、Unity、Unreal 等重型三维 / GIS 引擎，除非用户明确要求且理由充分。
- 不要引入后端框架、数据库驱动、MQTT、Kafka、Flink、WebSocket 实时链路或机器学习依赖，除非任务明确要求。
- 不要随意更换包管理器，不要删除 `bun.lock`。

## 目录结构

当前核心结构：

```text
src/
├── App.jsx
├── main.jsx
├── router.jsx
├── api/
├── components/
│   ├── gas/
│   ├── geo3d/
│   ├── geology/
│   ├── hydrology/
│   ├── layers/
│   ├── mining/
│   ├── panels/
│   ├── risk/
│   ├── scene/
│   └── warning/
├── config/
├── data/
├── hooks/
│   └── geoData/
├── mock/
├── mocks/
├── pages/
├── services/
├── store/
├── utils/
├── index.css
└── App.css

public/
└── data/
    └── geology-layers.json
```

职责约定：

- `src/App.jsx` 只渲染 `RouterProvider`。
- `src/router.jsx` 维护 TanStack Router code-based 路由。
- `src/pages/GeoModelPage.jsx` 负责组织主页面、面板、场景和 hooks。
- `src/components/geo3d/GeoScene.jsx` 负责 `<Canvas>`、灯光、控制器和三维图层组合。
- `src/components/geo3d/GeoLayerModel.jsx` 负责旧版地质分层模型。
- `src/components/geology/` 放地质对象组件。
- `src/components/mining/` 放巷道、工作面、推进相关组件。
- `src/components/hydrology/` 放水文对象组件。
- `src/components/gas/` 放瓦斯对象组件。
- `src/components/warning/` 放预警、风险范围、治理点等场景组件。
- `src/components/panels/` 放页面信息面板。
- `src/hooks/useGeoData.js` 和 `src/hooks/geoData/` 负责加载各类地质 / 生产 / 风险数据。
- `src/store/` 放 Zustand store，管理图层、选择态、场景状态等跨组件状态。
- `src/api/` 放 API 适配函数，不在组件里直接拼复杂请求。
- `src/mock/` 放静态 mock 数据模块。
- `src/mocks/` 放 MSW handlers 和 browser worker。
- `public/data/geology-layers.json` 保留旧版地层分层数据。

不要为了一个小功能搬迁目录或大规模改名。新增模块时先对齐现有目录习惯。

## 路由规则

项目使用 `@tanstack/react-router` 的 code-based route 配置。

当前路由：

| 路径 | 页面组件 | 说明 |
|---|---|---|
| `/` | `GeoModelPage` | 三维地质主页面 |
| `/geo-model` | `GeoModelPage` | 三维地质主页面别名 |

规则：

- 新增页面先在 `src/pages/` 创建页面组件，再在 `src/router.jsx` 中扩展 route tree。
- `App.jsx` 不承载三维业务逻辑。
- 不要引入 `react-router-dom`。
- 当前未使用 TanStack 文件路由，不要无故加入 `@tanstack/router-plugin`。

## React Three Fiber 规则

本项目必须保持 R3F 写法。

允许：

- 使用 `<Canvas>` 创建三维场景。
- 使用 R3F 组件组织 mesh、material、light、controls 和 helper。
- 使用 `useFrame` 处理必要动画。
- 使用 R3F 指针事件处理 hover、click、select。
- 使用 Three.js 的 `BufferGeometry`、材质、颜色、向量、几何工具等底层能力。
- 使用 `@react-three/drei` 的轻量组件，例如 `OrbitControls`、`Html`、`GizmoHelper`。

不允许，除非任务明确要求：

- 手动创建主 `new THREE.Scene()`。
- 手动创建主 `new THREE.WebGLRenderer()`。
- 手写独立的主 `requestAnimationFrame` 渲染循环替代 R3F。
- 绕过 R3F 组件体系重写整套三维场景。
- 在 React 生命周期外长期直接操作 canvas DOM。

如果参考原生 Three.js 示例，必须改写成 R3F 组件形式。

## 三维对象实现规则

实现或修改三维对象时：

- 数据优先来自 `src/mock/`、`src/api/`、`src/hooks/geoData/` 或 `public/data/`。
- 组件接收 `items`、`opacity`、选中态和回调等 props，避免直接读取无关全局状态。
- 固定 geometry、material 参数应使用 `useMemo` 或拆分小组件，避免每帧重复创建大量对象。
- 透明对象应合理设置 `transparent`、`opacity`、`depthWrite`、`side`、`renderOrder`，减少深度冲突。
- 交互优先使用 `onPointerOver`、`onPointerOut`、`onClick`，点击事件需要时调用 `stopPropagation()`。
- 高亮、预警光圈、距离线等效果应保持克制，不能遮挡主要地质对象。
- 不要求真实 GIS / BIM / 矿山坐标系统，不要声称 mock 几何等同真实建模成果。

透明材质常用原则：

- 半透明体优先使用 `meshStandardMaterial` 或 `meshBasicMaterial`。
- 多层透明叠加出现排序问题时，先调整透明度、`depthWrite={false}`、空间间距或 `renderOrder`。
- 不要为了透明排序问题重写渲染器或引入复杂后处理。

## 数据和 Mock/API 边界

当前项目支持两类数据来源：

- `src/mock/`：模块化静态 mock 数据。
- `public/data/geology-layers.json`：旧版地质分层 JSON。
- `src/api/` + `src/mocks/handlers.js`：API 适配与 MSW mock endpoint。

环境变量：

```text
VITE_ENABLE_MOCK=true|false
VITE_API_BASE_URL=/api
```

开发环境默认 `.env.development` 启用 MSW mock。生产环境 `.env.production` 默认关闭 mock，并指向 `http://127.0.0.1:8080`。

规则：

- 组件不要直接依赖 `src/mock/`，优先通过 `src/api/` 或 hooks 获取数据。
- 新增 mock 数据优先放在 `src/mock/`，并通过 `src/mock/index.js` 汇总。
- 新增 API mock endpoint 时同步更新 `src/mocks/handlers.js`。
- 新增数据加载逻辑优先放入 `src/hooks/geoData/` 对应分类 loader。
- `public/data/geology-layers.json` 主要服务旧版地层分层模型，不要随意改字段语义。
- 没有真实接口文档时，可以预留 API 适配函数，但不要编造真实后端能力。
- 真实接口字段与 mock 字段不一致时，应在 API 适配层或 loader 中归一化，避免污染场景组件。

错误处理：

- 数据加载失败不能导致白屏。
- 关键数据失败可显示清晰错误；非关键数据失败应回退为空数组或默认值。
- console 中可记录必要错误，但 UI 不展示大段技术栈错误。

## 状态管理

项目已经使用 Zustand，主要 store 位于 `src/store/`。

规则：

- 跨面板、跨场景共享状态可以进入 Zustand。
- 组件局部 hover、临时展开、局部输入等状态保持在组件内。
- 不要为了简单交互新增全局状态。
- 修改 store 时保持 action 命名清晰，例如 `toggleLayer`、`setLayerOpacity`、`clearSelection`。
- 不要把 fetch 副作用散落到多个组件里；已有 store 或 hook 能承载时优先复用。

## 图层系统

图层配置来自 `fetchLayerConfig()`，开发 mock 来自 `src/mock/layers.js`。

新增图层时通常需要同步：

- `src/mock/layers.js` 中的分组和 layer definition。
- 对应 mock 数据文件与 `src/mock/index.js` 导出。
- `src/api/` 中的 fetch 函数。
- `src/mocks/handlers.js` 中的 mock endpoint。
- `src/hooks/geoData/` 中对应 loader。
- `src/components/geo3d/GeoScene.jsx` 中的渲染入口。
- 需要时补充 `src/components/panels/` 的信息展示。

图层显隐和透明度应继续由 `useLayerStore` 控制，不要在多个组件中维护互相冲突的图层开关。

## 业务功能边界

允许做：

- 前端三维可视化。
- mock 数据展示。
- mock API 结构。
- 简单 API 适配层。
- 图层控制、信息面板、选择、高亮、距离线。
- 工作面推进的前端演示。
- 基于 mock 数据的风险和预警提示展示。

不要默认做：

- 用户登录、权限、组织架构。
- 后端服务、数据库、真实接口联调。
- 真实传感器接入、WebSocket、MQTT、Kafka、Flink。
- 真实瓦斯、水害、压力预测模型。
- 真实预警规则引擎和处置闭环。
- 完整后台管理系统或大屏驾驶舱重构。
- 真实 GIS / BIM / CAD 数据解析。

如果用户要求“接入原系统”，必须先明确接口、认证、数据库、部署和数据权限。只有截图或口头描述时，只能做前端原型或 mock 适配，不能声称已完成真实兼容。

## 样式和 UI

当前项目使用 Tailwind CSS 4 与普通 CSS。

规则：

- 页面重点是三维场景，控制面板服务于观察和筛选。
- 面板应简洁、可读，不遮挡主要观察区域。
- 图层颜色与三维对象保持一致。
- 新样式优先使用现有 Tailwind 写法和 `index.css` 基础样式。
- 不要为了少量 UI 引入大型组件库。
- 不要做营销落地页式布局。
- 不要堆叠无意义装饰、强烈动画或影响识别的视觉效果。
- 移动端和窄屏下不能出现明显文字重叠、按钮溢出或面板不可关闭问题。

`src/App.css` 中仍有模板遗留样式。不要在无关任务中大规模格式化或清理；如确实确认未使用，可以单独小步删除。

## 性能要求

这是前端原型，不需要过度优化，但要避免明显问题：

- 不要在 `useFrame` 中做复杂数据处理。
- 不要每帧创建 geometry、material、大数组或临时对象。
- 对固定几何、边界、颜色转换使用 `useMemo`。
- 大量 mesh 增加前先评估是否可合并、简化或实例化。
- 不要反复 fetch 同一份静态数据。
- 不要为了少量 mock 数据加入复杂缓存系统。

## Codex Skills 使用

本项目可参考本地 Three.js skills，但只作为实现参考：

- `threejs-geometry`：几何体、BufferGeometry、自定义形状。
- `threejs-materials`：透明、半透明、PBR、材质参数。
- `threejs-lighting`：灯光、阴影、环境光。
- `threejs-interaction`：raycasting、指针事件、选中交互。
- `threejs-animation`：必要的 R3F 动画或混合动画。

使用要求：

- skill 示例如果是原生 Three.js，必须转换成 R3F。
- 不要复制不适合本项目结构的大段示例。
- 不要因为 skill 改变项目架构或技术路线。

## 代码风格

- 使用 JavaScript / JSX。
- 使用函数组件和 React Hooks。
- 命名表达业务含义，不使用无意义缩写。
- import 保持简洁，删除无用 import 和调试输出。
- 不要把大型逻辑继续堆到 `GeoModelPage.jsx` 或 `GeoScene.jsx`；新增复杂对象时优先拆成组件或工具函数。
- 工具函数放入 `src/utils/`，API 函数放入 `src/api/`，数据加载放入 `src/hooks/geoData/`。
- 小范围修改，不格式化整个项目造成无关 diff。
- 保持 ESLint / Vite build 通过。

## 常用命令

优先使用 Bun：

```bash
bun install
bun run dev
bun run build
bun run lint
bun run preview
```

验证时根据改动选择：

- 文档或注释改动：通常不需要构建，但可以检查文件内容。
- JS/JSX/CSS 改动：至少运行 `bun run build`。
- 触及 lint 规则、hooks、复杂组件时运行 `bun run lint`。
- 前端视觉改动应启动 dev server 并在浏览器检查主要视图。

## 开发流程

Agent 修改本仓库时应：

1. 阅读本 `AGENTS.md`。
2. 查看 `package.json`，确认脚本和依赖。
3. 查看相关 `src/` 文件，理解现有组件、store、API 和 mock 数据。
4. 明确任务属于前端展示、API 适配、mock 数据扩展还是越界的真实系统能力。
5. 小步修改直接相关文件。
6. 保持 R3F、TanStack Router、Zustand、MSW 的既有模式。
7. 修改后运行合适验证命令。
8. 回复时说明改动文件、实现内容、验证结果和未完成事项。

## 文件修改原则

- 不要无关重构。
- 不要移动文件，除非确有必要。
- 不要删除用户已有改动。
- 不要破坏 mock 数据字段语义。
- 不要改包管理器或删除 lockfile。
- 新增依赖前必须判断是否真的必要，并说明原因。
- 如果遇到脏工作区，先识别相关与无关改动；不要回滚他人改动。

## 提交说明建议

如果需要生成提交说明，使用清晰短句：

```text
docs: rewrite agent instructions for current geo demo
feat: add hydrology layer controls
fix: handle missing warning mock data
refactor: split risk highlight helpers
```

避免：

```text
update
fix bug
change files
```

## 完成回复要求

完成任务后简要说明：

- 修改了哪些文件。
- 实现或调整了什么。
- 运行了哪些验证命令。
- 是否有未完成事项或需要用户确认的边界。

本项目的长期目标是：

> 在不膨胀为完整业务系统的前提下，用 React Three Fiber 做出清晰、稳定、可扩展的三维地质与矿山风险可视化前端原型。
