import { useState } from "react";
import React from "react";
import { FinancialEntry, FONTE_OPTIONS, CUSTEIO_OPTIONS } from "../types";
import { Camera, Send, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface EntryFormProps {
  onSubmit: (entry: FinancialEntry) => Promise<void>;
  onOpenScanner: (field: keyof FinancialEntry) => void;
  scannedData?: { field: keyof FinancialEntry; value: string };
}

export default function EntryForm({ onSubmit, onOpenScanner, scannedData }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialEntry>({
    faturadasERecebidas: "",
    processo: "",
    unidadeSaude: "",
    dataRecebimento: new Date().toISOString().split("T")[0],
    valorRecebido: 0,
    fonte: "Estadual",
    tipoCusteio: "Regular",
    mesFatura: "",
    conta: "",
    glosa: 0,
    saldoAReceber: 0,
  });

  // Re-sync scanned data if it changes
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  if (scannedData && scannedData.value !== lastScanned) {
    setFormData(prev => ({ ...prev, [scannedData.field]: scannedData.value }));
    setLastScanned(scannedData.value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form or show success
      setFormData({
        faturadasERecebidas: "",
        processo: "",
        unidadeSaude: "",
        dataRecebimento: new Date().toISOString().split("T")[0],
        valorRecebido: 0,
        fonte: "Estadual",
        tipoCusteio: "Regular",
        mesFatura: "",
        conta: "",
        glosa: 0,
        saldoAReceber: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none";
  const labelClasses = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Faturadas e Recebidas */}
        <div>
          <label className={labelClasses}>Faturadas e Recebidas</label>
          <div className="relative">
            <input
              type="text"
              name="faturadasERecebidas"
              value={formData.faturadasERecebidas}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Ex: FAT-2024-001"
              required
            />
            <button
              type="button"
              onClick={() => onOpenScanner("faturadasERecebidas")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500"
            >
              <Camera size={18} />
            </button>
          </div>
        </div>

        {/* Processo */}
        <div>
          <label className={labelClasses}>Processo</label>
          <div className="relative">
            <input
              type="text"
              name="processo"
              value={formData.processo}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Nº do Processo"
              required
            />
            <button
              type="button"
              onClick={() => onOpenScanner("processo")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500"
            >
              <Camera size={18} />
            </button>
          </div>
        </div>

        {/* Unidade de Saúde */}
        <div>
          <label className={labelClasses}>Unidade de Saúde</label>
          <input
            type="text"
            name="unidadeSaude"
            value={formData.unidadeSaude}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Nome da Unidade"
            required
          />
        </div>

        {/* Data do Recebimento */}
        <div>
          <label className={labelClasses}>Data do Recebimento</label>
          <input
            type="date"
            name="dataRecebimento"
            value={formData.dataRecebimento}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        {/* Valor Recebido */}
        <div>
          <label className={labelClasses}>Valor Recebido (R$)</label>
          <input
            type="number"
            step="0.01"
            name="valorRecebido"
            value={formData.valorRecebido}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        {/* Fonte */}
        <div>
          <label className={labelClasses}>Fonte</label>
          <select
            name="fonte"
            value={formData.fonte}
            onChange={handleChange}
            className={inputClasses}
          >
            {FONTE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Custeio */}
        <div>
          <label className={labelClasses}>Tipo de Custeio</label>
          <select
            name="tipoCusteio"
            value={formData.tipoCusteio}
            onChange={handleChange}
            className={inputClasses}
          >
            {CUSTEIO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Mês da Fatura */}
        <div>
          <label className={labelClasses}>Mês da Fatura</label>
          <input
            type="month"
            name="mesFatura"
            value={formData.mesFatura}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        {/* Conta */}
        <div>
          <label className={labelClasses}>Conta</label>
          <input
            type="text"
            name="conta"
            value={formData.conta}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Nº da Conta"
            required
          />
        </div>

        {/* Glosa */}
        <div>
          <label className={labelClasses}>Glosa (R$)</label>
          <input
            type="number"
            step="0.01"
            name="glosa"
            value={formData.glosa}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Saldo a Receber */}
        <div>
          <label className={labelClasses}>Saldo a Receber (R$)</label>
          <input
            type="number"
            step="0.01"
            name="saldoAReceber"
            value={formData.saldoAReceber}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50",
            loading && "cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Enviando...
            </>
          ) : (
            <>
              <Send size={20} />
              Lançar Dados
            </>
          )}
        </button>
      </div>
    </form>
  );
}
