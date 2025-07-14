import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function Root() {
  return (
    <>
      <header className="bg-slate-100">
        <nav className="px-8 py-3 flex gap-2 max-w-[800px] mx-auto">
          <Link to="/">Home</Link>
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
