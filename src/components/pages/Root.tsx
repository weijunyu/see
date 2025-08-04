import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function Root() {
  return (
    <>
      <header className="bg-slate-200 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
        <nav className="px-8 py-3 flex gap-2 max-w-[800px] mx-auto font-semibold font-mono">
          <Link to="/">see</Link>
        </nav>
      </header>

      <main className="min-h-screen flex flex-row justify-center bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-50">
        <div className="max-w-[800px] px-8 pt-4 pb-16">
          <Outlet />
        </div>
        <TanStackRouterDevtools />
      </main>
    </>
  );
}
