import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus,
  Users,
  Settings,
  LogOut,
  FileText,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/nouvelle-facture", icon: FilePlus, label: "Nouvelle facture" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/parametres", icon: Settings, label: "Paramètres" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fermer la sidebar sur changement de route (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[280px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
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
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
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
          {profile.owner_name || profile.business_name ? (
            <div className="px-4 py-2 mb-2">
              <p className="text-white text-sm font-medium truncate">
                {profile.owner_name || profile.business_name}
              </p>
              {profile.business_name && profile.owner_name && (
                <p className="text-indigo-300 text-xs truncate">
                  {profile.business_name}
                </p>
              )}
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-300 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
