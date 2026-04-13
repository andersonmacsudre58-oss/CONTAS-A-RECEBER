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
          const formatted = rows.slice(1).map((row: any[]) => ({
            faturadasERecebidas: row[0],
            processo: row[1],
            unidadeSaude: row[2],
            dataRecebimento: row[3],
            valorRecebido: parseFloat(row[4]) || 0,
            fonte: row[5],
            tipoCusteio: row[6],
            mesFatura: row[7],
            conta: row[8],
            glosa: parseFloat(row[9]) || 0,
            saldoAReceber: parseFloat(row[10]) || 0,
          }));
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
        entry.faturadasERecebidas,
        entry.processo,
        entry.unidadeSaude,
        entry.dataRecebimento,
        entry.valorRecebido,
        entry.fonte,
        entry.tipoCusteio,
        entry.mesFatura,
        entry.conta,
        entry.glosa,
        entry.saldoAReceber,
        new Date().toISOString(), // Timestamp
      ];

      const response = await axios.post("/api/sheets/append", { values });
      if (response.data.success) {
        setEntries((prev) => [entry, ...prev]);
        setActiveTab("dashboard");
      }
    } catch (error) {
      console.error("Error submitting entry:", error);
      alert("Erro ao enviar para o Google Sheets. Verifique a configuração.");
    }
  };

  const handleScan = (data: string) => {
    if (scanningField) {
      setScannedData({ field: scanningField, value: data });
      setScannerOpen(false);
      setScanningField(null);
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
            onClick={() => setActiveTab("form")}
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

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <Settings size={20} />
            Configurações
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={20} />
            Sair
          </button>
        </div>
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
                    onOpenScanner={(field) => {
                      setScanningField(field);
                      setScannerOpen(true);
                    }} 
                  />
                </div>
              ) : (
                <Dashboard entries={entries} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

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
