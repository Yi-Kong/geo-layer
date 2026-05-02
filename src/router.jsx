import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import GeoModelPage from "./pages/GeoModelPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: GeoModelPage,
});

const geoModelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/geo-model",
  component: GeoModelPage,
});

const routeTree = rootRoute.addChildren([indexRoute, geoModelRoute]);

export const router = createRouter({ routeTree });
