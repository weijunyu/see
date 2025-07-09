import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/root";
import { indexRoute } from "./routes";
import { pageRoute } from "./routes/page";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const routeTree = rootRoute.addChildren([indexRoute, pageRoute]);

export const router = createRouter({ routeTree });
