import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function Root() {
  return (
    <main className="max-w-[800px] mx-auto">
      <div className="p-2 flex gap-2">
        <Link to="/">Home</Link>
      </div>

      <hr />

      <Outlet />
      <TanStackRouterDevtools />
    </main>
  );
}

export const rootRoute = createRootRoute({
  component: Root,
});
