import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  Users,
  Settings,
  FileText,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/nouvelle-facture", icon: FilePlus, label: "Nouvelle facture" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/parametres", icon: Settings, label: "Paramètres" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Facture App
            </h1>
            <p className="text-indigo-300 text-xs">Créez vos factures</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/15 text-white shadow-lg shadow-indigo-500/10"
                  : "text-indigo-200 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-indigo-400 text-xs text-center">Mode local</p>
      </div>
    </aside>
  );
}
