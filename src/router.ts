import { createRouter } from "@tanstack/react-router";
import { rootRoute, indexRoute, pageRoute } from "./routes.tsx";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const routeTree = rootRoute.addChildren([indexRoute, pageRoute]);

export const router = createRouter({ routeTree });
