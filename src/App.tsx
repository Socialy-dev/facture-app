import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { Loader2 } from "lucide-react";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import InvoiceView from "./pages/InvoiceView";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { initialize, user, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            initialized && user ? <Navigate to="/" replace /> : <Login />
          }
        />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/nouvelle-facture" element={<NewInvoice />} />
          <Route path="/facture/:id" element={<InvoiceView />} />
          <Route path="/modifier-facture/:id" element={<NewInvoice />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/parametres" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
