import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  X,
  MapPin,
  Phone,
  Mail,
  Building2,
  Search,
} from "lucide-react";
import { useDataStore } from "../store/data";

interface ClientForm {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  email: string;
  phone: string;
}

const emptyForm: ClientForm = {
  name: "",
  address: "",
  postal_code: "",
  city: "",
  email: "",
  phone: "",
};

export default function Clients() {
  const { clients, fetchClients, createClient, updateClient, deleteClient } =
    useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    setForm({
      name: client.name,
      address: client.address,
      postal_code: client.postal_code,
      city: client.city,
      email: client.email ?? "",
      phone: client.phone ?? "",
    });
    setEditingId(id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editingId) {
      await updateClient(editingId, {
        ...form,
        email: form.email || null,
        phone: form.phone || null,
      });
    } else {
      await createClient({
        ...form,
        email: form.email || null,
        phone: form.phone || null,
      });
    }
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Gérez votre base de clients</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25"
        >
          <Plus className="w-5 h-5" />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {search ? "Aucun client trouvé" : "Aucun client pour le moment"}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Ajouter votre premier client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(client.id)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {client.address}, {client.postal_code} {client.city}
                  </span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{client.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Modifier le client" : "Nouveau client"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom / Raison sociale *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nom du client"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse *
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code postal *
                  </label>
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="75001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ville *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Paris"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="client@email.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-all text-sm"
              >
                {editingId ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
