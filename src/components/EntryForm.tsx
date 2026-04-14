import { useState, useEffect, useRef } from "react";
import React from "react";
import { FinancialEntry, FONTE_OPTIONS, CUSTEIO_OPTIONS, SIM_NAO_OPTIONS } from "../types";
import { Camera, Send, Loader2, ScanLine, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";

interface EntryFormProps {
  onSubmit: (entry: FinancialEntry) => Promise<void>;
  onOpenScanner: (field: keyof FinancialEntry) => void;
  scannedData?: { field: keyof FinancialEntry; value: string };
  initialData?: FinancialEntry | null;
  onCancel?: () => void;
}

export default function EntryForm({ onSubmit, onOpenScanner, scannedData, initialData, onCancel }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FinancialEntry>(initialData || {
    processo: "",
    id: "",
    taxa3: "Não",
    fonte: "Estadual",
    custeio: "Regular",
    conta: "",
    glosa: 0,
    valorFaturado: 0,
    dataRecebimento: new Date().toISOString().split("T")[0],
    valorRecebido: 0,
    saldoAReceber: 0,
    houveParcela: "Não",
    dataRecebimento2: "",
    valorRecebido2: 0,
    dataRecebimento3: "",
    valorRecebido3: 0,
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
        processo: "",
        id: "",
        taxa3: "Não",
        fonte: "Estadual",
        custeio: "Regular",
        conta: "",
        glosa: 0,
        valorFaturado: 0,
        dataRecebimento: new Date().toISOString().split("T")[0],
        valorRecebido: 0,
        saldoAReceber: 0,
        houveParcela: "Não",
        dataRecebimento2: "",
        valorRecebido2: 0,
        dataRecebimento3: "",
        valorRecebido3: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalize = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsExtracting(true);
        const base64Image = e.target?.result as string;
        
        const response = await axios.post("/api/ocr/extract", { image: base64Image });
        if (response.data.success) {
          const extracted = response.data.data;
          setFormData(prev => ({
            ...prev,
            ...extracted,
            // Ensure numbers are numbers
            valorRecebido: parseFloat(extracted.valorRecebido) || 0,
            glosa: parseFloat(extracted.glosa) || 0,
            saldoAReceber: parseFloat(extracted.saldoAReceber) || 0,
            valorFaturado: parseFloat(extracted.valorFaturado) || 0,
            valorRecebido2: parseFloat(extracted.valorRecebido2) || 0,
            valorRecebido3: parseFloat(extracted.valorRecebido3) || 0,
          }));
          alert("Dados extraídos com sucesso pela IA!");
        }
      } catch (error) {
        console.error("Erro na extração IA:", error);
        alert("Não foi possível extrair os dados automaticamente. Tente uma foto mais nítida.");
      } finally {
        setIsExtracting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const inputClasses = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none";
  const labelClasses = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Informações do Recebimento</h3>
          <p className="text-sm text-slate-500">Preencha manualmente ou use a IA para digitalizar.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleDigitalize} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
            className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50"
          >
            {isExtracting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            {isExtracting ? "Digitalizando..." : "Digitalizar Documento"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        {/* ID */}
        <div>
          <label className={labelClasses}>ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Identificador"
            required
          />
        </div>

        {/* Taxa 3% */}
        <div>
          <label className={labelClasses}>Taxa 3%</label>
          <select
            name="taxa3"
            value={formData.taxa3}
            onChange={handleChange}
            className={inputClasses}
          >
            {SIM_NAO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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

        {/* Custeio */}
        <div>
          <label className={labelClasses}>Custeio</label>
          <select
            name="custeio"
            value={formData.custeio}
            onChange={handleChange}
            className={inputClasses}
          >
            {CUSTEIO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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

        {/* Valor Faturado */}
        <div>
          <label className={labelClasses}>Valor Faturado (R$)</label>
          <input
            type="number"
            step="0.01"
            name="valorFaturado"
            value={formData.valorFaturado}
            onChange={handleChange}
            className={inputClasses}
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

        {/* Houve Parcela? */}
        <div>
          <label className={labelClasses}>Houve Parcela?</label>
          <select
            name="houveParcela"
            value={formData.houveParcela}
            onChange={handleChange}
            className={inputClasses}
          >
            {SIM_NAO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Conditional Fields for Installments */}
        {formData.houveParcela === "Sim" && (
          <>
            <div>
              <label className={labelClasses}>Data Recebimento 2ª Parcela</label>
              <input
                type="date"
                name="dataRecebimento2"
                value={formData.dataRecebimento2}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Valor Recebido 2ª Parcela (R$)</label>
              <input
                type="number"
                step="0.01"
                name="valorRecebido2"
                value={formData.valorRecebido2}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Data Recebimento 3ª Parcela</label>
              <input
                type="date"
                name="dataRecebimento3"
                value={formData.dataRecebimento3}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Valor Recebido 3ª Parcela (R$)</label>
              <input
                type="number"
                step="0.01"
                name="valorRecebido3"
                value={formData.valorRecebido3}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-8 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
          >
            Cancelar
          </button>
        )}
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
              {initialData ? "Salvar Alterações" : "Lançar Dados"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
