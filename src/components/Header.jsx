export default function Header({ mineInfo }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/82 px-5 text-slate-100 shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className="min-w-0">
        <div className="truncate text-base font-semibold text-cyan-100">
          三维透明地质统一图层控制系统
        </div>
        <div className="mt-1 truncate text-[11px] text-slate-400">
          {mineInfo?.name} / {mineInfo?.location} / {mineInfo?.coordinateSystem}
        </div>
      </div>

      <div className="hidden items-center gap-2 text-[11px] text-slate-300 md:flex">
        <span className="border border-emerald-300/25 px-3 py-1.5 text-emerald-100">
          mock 数据
        </span>
        <span className="border border-cyan-300/20 px-3 py-1.5 text-cyan-100">
          R3F 三维场景
        </span>
        <span className="border border-white/10 px-3 py-1.5">
          前端演示模式
        </span>
      </div>
    </header>
  );
}
