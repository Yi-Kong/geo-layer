import { gasLoaders } from "./gasLoaders";
import { geologyLoaders } from "./geologyLoaders";
import { mineLoaders } from "./mineLoaders";
import { productionLoaders } from "./productionLoaders";
import { riskLoaders } from "./riskLoaders";
import { warningLoaders } from "./warningLoaders";
import { waterLoaders } from "./waterLoaders";

export { geoDataDefaults } from "./geoDataDefaults";

const loaderGroups = [
  mineLoaders,
  geologyLoaders,
  productionLoaders,
  waterLoaders,
  gasLoaders,
  riskLoaders,
  warningLoaders,
];

export const geoDataLoaders = new Map(
  loaderGroups.flatMap((loaders) => [...loaders])
);
