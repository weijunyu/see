import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function Root() {
  return (
    <main className="max-w-[800px] min-h-screen mx-auto">
      <div className="p-2 flex gap-2">
        <Link to="/">Home</Link>
      </div>

      <hr />

      <div className="p-8">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </main>
  );
}
