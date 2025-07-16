import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function Root() {
  return (
    <>
      <header className="bg-slate-200">
        <nav className="px-8 py-3 flex gap-2 max-w-[800px] mx-auto font-semibold font-mono">
          <Link to="/">see</Link>
        </nav>
      </header>

      <main className="max-w-[800px] min-h-screen mx-auto">
        <div className="px-8 py-4">
          <Outlet />
        </div>
        <TanStackRouterDevtools />
      </main>
    </>
  );
}
