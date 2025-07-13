import { createRootRoute, createRoute } from "@tanstack/react-router";
import { Root } from "./components/pages/Root";
import { Index } from "./components/pages/Index";
import { Page } from "./components/pages/Page";

export const rootRoute = createRootRoute({
  component: Root,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

export const pageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$name",
  component: Page,
});
