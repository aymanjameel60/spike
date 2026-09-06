import { KeyRound, Users } from "lucide-react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";

const ALLOWED_SETTINGS = ["/settings/users", "/settings/publishable-api-keys"];

/**
 * Spike keeps Mercur's internal settings/services intact, but only exposes
 * the two settings screens that are actually needed by the Spike admin UI.
 */
export const SettingsLayout = () => {
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, "");

  if (path === "/settings") {
    return <Navigate to="/settings/users" replace />;
  }

  const allowed = ALLOWED_SETTINGS.some(
    (base) => path === base || path.startsWith(`${base}/`),
  );

  if (!allowed) {
    return <Navigate to="/settings/users" replace />;
  }

  const itemClass = (base: string) => {
    const active = path === base || path.startsWith(`${base}/`);
    return [
      "flex min-h-11 items-center gap-3 rounded-[18px] px-4 py-2.5 text-sm font-bold transition-colors",
      active
        ? "bg-[#090909] text-white"
        : "bg-white text-[#090909] hover:bg-[#e9e9e9]",
    ].join(" ");
  };

  return (
    <div className="min-h-screen bg-[#ededed] text-[#090909]" dir="rtl">
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-5 md:grid-cols-[240px_minmax(0,1fr)] md:px-7 md:py-6">
        <aside className="h-fit rounded-[22px] bg-[#e9e9e9] p-3">
          <div className="mb-3 px-2 py-2">
            <h1 className="text-xl font-extrabold">الإعدادات</h1>
            <p className="mt-1 text-xs leading-5 text-[#8f8f8f]">إعدادات Spike الأساسية فقط</p>
          </div>
          <nav className="grid gap-2">
            <Link to="/settings/users" className={itemClass("/settings/users")}>
              <Users size={19} />
              <span>المستخدمين</span>
            </Link>
            <Link
              to="/settings/publishable-api-keys"
              className={itemClass("/settings/publishable-api-keys")}
            >
              <KeyRound size={19} />
              <span>مفاتيح API القابلة للنشر</span>
            </Link>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
