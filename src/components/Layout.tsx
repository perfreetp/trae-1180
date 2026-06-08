import { useState, useMemo } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Store,
  FileText,
  Users,
  Truck,
  MessageSquareWarning,
  ClipboardCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "摊位台账", icon: Store, path: "/stalls" },
  { label: "合同费用", icon: FileText, path: "/contracts" },
  { label: "商户档案", icon: Users, path: "/merchants" },
  { label: "进货登记", icon: Truck, path: "/purchases" },
  { label: "投诉处理", icon: MessageSquareWarning, path: "/complaints" },
  { label: "巡查整改", icon: ClipboardCheck, path: "/inspections" },
  { label: "看板报表", icon: BarChart3, path: "/dashboard" },
];

const pathToLabel = Object.fromEntries(navItems.map((item) => [item.path, item.label]));

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentLabel = useMemo(() => {
    const matched = navItems
      .filter((item) => location.pathname.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0];
    return matched?.label ?? "摊位台账";
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <aside
        className={`flex flex-col ${
          collapsed ? "w-16" : "w-56"
        } h-full bg-forest-600 transition-all duration-300 shrink-0`}
      >
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          {!collapsed && (
            <span className="text-amber-warm font-bold text-lg tracking-wide">
              市场管理
            </span>
          )}
          {collapsed && (
            <span className="text-amber-warm font-bold text-lg">市</span>
          )}
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-md transition-colors relative ${
                  isActive
                    ? "bg-forest-500 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-warm rounded-r" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center justify-center h-10 text-white/60 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center h-14 px-6 bg-white border-b border-gray-200 shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">{currentLabel}</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-ivory-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
