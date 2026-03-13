import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import InvoiceView from "./pages/InvoiceView";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
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
