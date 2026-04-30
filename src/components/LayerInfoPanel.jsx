import Legend from "./Legend";

const infoRows = [
  ["层号", "id"],
  ["岩性", "lithology"],
  ["时代", "age"],
  ["厚度", "thickness"],
  ["孔隙性", "porosity"],
  ["渗透性", "permeability"],
];

export default function LayerInfoPanel({ layer }) {
  return (
    <>
      <div className="my-[14px] h-px bg-black/[0.08]" />

      <div className="mb-2.5 text-sm font-bold text-[#3d3d3d]">
        当前选中地层
      </div>

      {!layer && <div className="state-text">当前没有选中任何地层。</div>}

      {layer && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Legend color={layer.color} />
            <span className="text-[15px] font-bold text-[#222]">
              {layer.name}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {infoRows.map(([label, key]) => (
              <div
                className="flex justify-between gap-4 text-[13px] leading-[1.5]"
                key={key}
              >
                <span className="min-w-16 text-[#666]">{label}</span>
                <span className="flex-1 text-right text-[#222]">
                  {key === "thickness"
                    ? `${Number(layer.thickness).toFixed(2)} m`
                    : layer[key]}
                </span>
              </div>
            ))}

            <div className="flex flex-col gap-1 text-[13px] leading-[1.5]">
              <span className="min-w-16 text-[#666]">说明</span>
              <span className="flex-1 text-left text-[#222]">
                {layer.description}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
