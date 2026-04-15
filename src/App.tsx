import { useState, useEffect } from "react";
import { FinancialEntry } from "./types";
import EntryForm from "./components/EntryForm";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import { Wallet, LayoutDashboard, PlusCircle, Settings, LogOut, Bell } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "dashboard">("form");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningField, setScanningField] = useState<keyof FinancialEntry | null>(null);
  const [scannedData, setScannedData] = useState<{ field: keyof FinancialEntry; value: string } | undefined>();
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get("/api/sheets/data");
      if (response.data.success) {
        // Skip header row if it exists
        const rows = response.data.data;
        if (rows.length > 0) {
          const formatted = rows.slice(1)
            .map((row: any[], index: number) => ({
              rowIndex: index + 2,
              processo: row[0],
              id: row[1],
              taxa3: row[2],
              glosa: parseFloat(row[3]) || 0,
              valorFaturado: parseFloat(row[4]) || 0,
              dataRecebimento: row[5],
              valorRecebido: parseFloat(row[6]) || 0,
              saldoAReceber: parseFloat(row[7]) || 0,
              houveParcela: row[8],
              quantidadeParcelas: parseInt(row[9]) || 1,
              dataRecebimento2: row[10],
              valorRecebido2: parseFloat(row[11]) || 0,
              dataRecebimento3: row[12],
              valorRecebido3: parseFloat(row[13]) || 0,
              dataRecebimento4: row[14],
              valorRecebido4: parseFloat(row[15]) || 0,
              dataRecebimento5: row[16],
              valorRecebido5: parseFloat(row[17]) || 0,
            }))
            .filter(entry => entry.processo || entry.id);
          setEntries(formatted);
        }
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const handleFormSubmit = async (entry: FinancialEntry) => {
    try {
      const values = [
        entry.processo,
        entry.id,
        entry.taxa3,
        entry.glosa,
        entry.valorFaturado,
        entry.dataRecebimento,
        entry.valorRecebido,
        entry.saldoAReceber,
        entry.houveParcela,
        entry.quantidadeParcelas || 1,
        entry.dataRecebimento2 || "",
        entry.valorRecebido2 || 0,
        entry.dataRecebimento3 || "",
        entry.valorRecebido3 || 0,
        entry.dataRecebimento4 || "",
        entry.valorRecebido4 || 0,
        entry.dataRecebimento5 || "",
        entry.valorRecebido5 || 0,
        new Date().toISOString(), // Timestamp
      ];

      if (editingEntry?.rowIndex) {
        await axios.put(`/api/sheets/update/${editingEntry.rowIndex}`, { values });
        setEditingEntry(null);
      } else {
        await axios.post("/api/sheets/append", { values });
      }
      
      fetchEntries();
      setActiveTab("dashboard");
    } catch (error: any) {
      console.error("Error submitting entry:", error);
      const serverError = error.response?.data?.error || "Erro desconhecido";
      alert(`Erro no Google Sheets: ${serverError}\n\nVerifique se o e-mail da Conta de Serviço foi adicionado como Editor na planilha.`);
    }
  };

  const handleScan = (data: string) => {
    if (scanningField) {
      setScannedData({ field: scanningField, value: data });
      setScannerOpen(false);
      setScanningField(null);
    }
  };

  const handleEdit = (entry: FinancialEntry) => {
    setEditingEntry(entry);
    setActiveTab("form");
  };

  const handleDelete = async (rowIndex: number) => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/sheets/delete/${rowIndex}`);
      await fetchEntries();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Erro ao excluir lançamento. Verifique os logs.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar / Navigation */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Contas a Receber</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => {
              setActiveTab("form");
              setEditingEntry(null);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "form" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <PlusCircle size={20} />
            Novo Lançamento
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <Wallet className="text-blue-600" size={24} />
          <span className="font-bold">Contas a Receber</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500">
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-200"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl p-6 lg:p-10">
          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {activeTab === "form" ? "Lançamento de Dados" : "Visão Geral"}
              </h2>
              <p className="mt-1 text-slate-500">
                {activeTab === "form" 
                  ? "Preencha os campos abaixo para registrar um novo recebimento." 
                  : "Acompanhe o status dos seus recebimentos e faturas."}
              </p>
            </div>
            
            {/* Mobile Tab Switcher */}
            <div className="flex rounded-lg bg-slate-100 p-1 lg:hidden">
              <button
                onClick={() => setActiveTab("form")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "form" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                Lançar
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "dashboard" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                Dashboard
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "form" ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                  <EntryForm 
                    onSubmit={handleFormSubmit} 
                    scannedData={scannedData}
                    initialData={editingEntry}
                    onCancel={() => {
                      setEditingEntry(null);
                      setActiveTab("dashboard");
                    }}
                    onOpenScanner={(field) => {
                      setScanningField(field);
                      setScannerOpen(true);
                    }} 
                  />
                </div>
              ) : (
                <Dashboard 
                  entries={entries} 
                  onEdit={handleEdit}
                  onDelete={(row) => setDeleteConfirm(row)}
                  onRefresh={fetchEntries}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita na planilha.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Scanner Modal */}
      {scannerOpen && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => {
            setScannerOpen(false);
            setScanningField(null);
          }} 
        />
      )}
    </div>
  );
}
