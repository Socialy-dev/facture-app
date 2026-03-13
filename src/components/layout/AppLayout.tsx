import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen gradient-surface">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Mobile header */}
      <div className="sticky top-0 z-30 lg:hidden bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900">Facture App</span>
        </div>
      </div>

      <main className="lg:ml-[280px] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
