import LegacyStrataModelGroup from "../LegacyStrataModelGroup";
import BoreholeLayer from "../../geology/BoreholeLayer";
import CoalSeamLayer from "../../geology/CoalSeamLayer";
import CollapseColumnLayer from "../../geology/CollapseColumnLayer";
import FaultLayer from "../../geology/FaultLayer";
import StrataLayer from "../../geology/StrataLayer";

export default function GeologyLayerGroup({
  layers = {},
  opacities = {},
  strata = [],
  coalSeams = [],
  boreholes = [],
  faults = [],
  collapseColumns = [],
  layerData = [],
  visibleLayerIds = [],
  explode = 0,
  selectedLayerId,
  onSelectLayer,
}) {
  return (
    <>
      {layers.strata && (
        <>
          {strata.map((layer) => (
            <StrataLayer
              key={layer.id}
              layer={layer}
              opacity={opacities.strata}
            />
          ))}

          <LegacyStrataModelGroup
            layerData={layerData}
            visibleLayerIds={visibleLayerIds}
            explode={explode}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSelectLayer}
            opacity={opacities.strata}
          />
        </>
      )}

      {layers.coalSeams && (
        <CoalSeamLayer items={coalSeams} opacity={opacities.coalSeams} />
      )}

      {layers.boreholes && (
        <BoreholeLayer items={boreholes} opacity={opacities.boreholes} />
      )}

      {layers.faults && (
        <FaultLayer items={faults} opacity={opacities.faults} />
      )}

      {layers.collapseColumns && (
        <CollapseColumnLayer
          items={collapseColumns}
          opacity={opacities.collapseColumns}
        />
      )}
    </>
  );
}
