import { useState, useEffect, useRef } from "react";
import React from "react";
import { FinancialEntry, SIM_NAO_OPTIONS, FONTE_OPTIONS, CONTA_OPTIONS, CUSTEIO_OPTIONS, MESES_OPTIONS } from "../types";
import { Send } from "lucide-react";
import { cn } from "../lib/utils";
import axios from "axios";

interface EntryFormProps {
  onSubmit: (entry: FinancialEntry) => Promise<void>;
  initialData?: FinancialEntry | null;
  onCancel?: () => void;
}

export default function EntryForm({ onSubmit, initialData, onCancel }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FinancialEntry>(initialData || {
    processo: "",
    id: "",
    aditivos: "",
    mesFatura: MESES_OPTIONS[new Date().getMonth()],
    dataOficio: "",
    taxa3: "Não",
    glosa: 0,
    valorFaturado: 0,
    dataRecebimento: new Date().toISOString().split("T")[0],
    valorRecebido: 0,
    saldoAReceber: 0,
    fonte: "SES",
    tipoConta: "ESTADUAL",
    tipoCusteio: "CUSTEIO REGULAR",
    houveParcela: "Não",
    quantidadeParcelas: 1,
    dataRecebimento2: "",
    valorRecebido2: 0,
    dataRecebimento3: "",
    valorRecebido3: 0,
    dataRecebimento4: "",
    valorRecebido4: 0,
    dataRecebimento5: "",
    valorRecebido5: 0,
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Real-time calculation of Saldo a Receber
  useEffect(() => {
    const faturado = formData.valorFaturado || 0;
    const glosa = formData.glosa || 0;
    const rec1 = formData.valorRecebido || 0;
    const rec2 = formData.houveParcela === "Sim" ? (formData.valorRecebido2 || 0) : 0;
    const rec3 = formData.houveParcela === "Sim" ? (formData.valorRecebido3 || 0) : 0;
    const rec4 = formData.houveParcela === "Sim" ? (formData.valorRecebido4 || 0) : 0;
    const rec5 = formData.houveParcela === "Sim" ? (formData.valorRecebido5 || 0) : 0;

    const totalRecebido = rec1 + rec2 + rec3 + rec4 + rec5;
    const saldo = faturado - glosa - totalRecebido;

    if (formData.saldoAReceber !== saldo) {
      setFormData(prev => ({ ...prev, saldoAReceber: saldo }));
    }
  }, [
    formData.valorFaturado,
    formData.glosa,
    formData.valorRecebido,
    formData.valorRecebido2,
    formData.valorRecebido3,
    formData.valorRecebido4,
    formData.valorRecebido5,
    formData.houveParcela
  ]);

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
        aditivos: "",
        mesFatura: MESES_OPTIONS[new Date().getMonth()],
        dataOficio: "",
        taxa3: "Não",
        glosa: 0,
        valorFaturado: 0,
        dataRecebimento: new Date().toISOString().split("T")[0],
        valorRecebido: 0,
        saldoAReceber: 0,
        fonte: "SES",
        tipoConta: "ESTADUAL",
        tipoCusteio: "CUSTEIO REGULAR",
        houveParcela: "Não",
        quantidadeParcelas: 1,
        dataRecebimento2: "",
        valorRecebido2: 0,
        dataRecebimento3: "",
        valorRecebido3: 0,
        dataRecebimento4: "",
        valorRecebido4: 0,
        dataRecebimento5: "",
        valorRecebido5: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none";
  const labelClasses = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500";
  const currencyInputContainer = "relative flex items-center";
  const currencyPrefix = "absolute left-3 text-gray-400 text-sm font-medium pointer-events-none";
  const currencyInput = cn(inputClasses, "pl-10");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Informações do Faturamento</h3>
          <p className="text-sm text-slate-500">Insira os dados iniciais do processo e fatura.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Processo */}
        <div>
          <label className={labelClasses}>Processo</label>
          <input
            type="text"
            name="processo"
            value={formData.processo}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Nº do Processo"
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

        {/* Mês da Fatura */}
        <div>
          <label className={labelClasses}>Mês da Fatura</label>
          <select
            name="mesFatura"
            value={formData.mesFatura}
            onChange={handleChange}
            className={inputClasses}
          >
            {MESES_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Data Ofício */}
        <div>
          <label className={labelClasses}>Data Ofício</label>
          <input
            type="date"
            name="dataOficio"
            value={formData.dataOficio}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Aditivos */}
        <div>
          <label className={labelClasses}>Aditivos</label>
          <input
            type="text"
            name="aditivos"
            value={formData.aditivos}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Ex: 01, 02, etc"
          />
        </div>

        {/* Valor Faturado */}
        <div>
          <label className={labelClasses}>Valor Faturado</label>
          <div className={currencyInputContainer}>
            <span className={currencyPrefix}>R$</span>
            <input
              type="number"
              step="0.01"
              name="valorFaturado"
              value={formData.valorFaturado}
              onChange={handleChange}
              className={currencyInput}
              required
            />
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-slate-50 mt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Informações do Recebimento</h4>
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

        {/* Glosa */}
        <div>
          <label className={labelClasses}>Glosa</label>
          <div className={currencyInputContainer}>
            <span className={currencyPrefix}>R$</span>
            <input
              type="number"
              step="0.01"
              name="glosa"
              value={formData.glosa}
              onChange={handleChange}
              className={currencyInput}
            />
          </div>
        </div>

        {/* Aditivos */}
        {/* Aditivos is already in the header section */}

        {/* Data do Recebimento */}
        <div>
          <label className={labelClasses}>Data do Recebimento</label>
          <input
            type="date"
            name="dataRecebimento"
            value={formData.dataRecebimento}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* Valor Recebido */}
        <div>
          <label className={labelClasses}>Valor Recebido</label>
          <div className={currencyInputContainer}>
            <span className={currencyPrefix}>R$</span>
            <input
              type="number"
              step="0.01"
              name="valorRecebido"
              value={formData.valorRecebido}
              onChange={handleChange}
              className={currencyInput}
            />
          </div>
        </div>

        {/* Saldo a Receber */}
        <div>
          <label className={labelClasses}>Saldo a Receber (Calculado)</label>
          <div className={currencyInputContainer}>
            <span className={currencyPrefix}>R$</span>
            <input
              type="number"
              step="0.01"
              name="saldoAReceber"
              value={formData.saldoAReceber}
              className={cn(currencyInput, "bg-blue-50/50 font-bold text-blue-700 pointer-events-none")}
              readOnly
            />
          </div>
        </div>

        {/* Fonte */}
        {/* Removed duplicate from here as it's now in the header section */}

        {/* Tipo de Conta */}
        <div>
          <label className={labelClasses}>Tipo de Conta</label>
          <select
            name="tipoConta"
            value={formData.tipoConta}
            onChange={handleChange}
            className={inputClasses}
          >
            {CONTA_OPTIONS.map((opt) => (
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

        {/* Quantidade de Parcelas */}
        {formData.houveParcela === "Sim" && (
          <div>
            <label className={labelClasses}>Quantidade de Parcelas</label>
            <select
              name="quantidadeParcelas"
              value={formData.quantidadeParcelas}
              onChange={handleChange}
              className={inputClasses}
            >
              {[2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        )}

        {/* Conditional Fields for Installments */}
        {formData.houveParcela === "Sim" && (
          <div className="md:col-span-2 lg:col-span-3 space-y-6 mt-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detalhamento das Parcelas Extras</h4>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                {formData.quantidadeParcelas}x Total
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Parcela 2 */}
              {Number(formData.quantidadeParcelas) >= 2 && (
                <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-200/50">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">2</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Segunda Parcela</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClasses}>Data Recebimento</label>
                      <input
                        type="date"
                        name="dataRecebimento2"
                        value={formData.dataRecebimento2}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Valor Recebido</label>
                      <div className={currencyInputContainer}>
                        <span className={currencyPrefix}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="valorRecebido2"
                          value={formData.valorRecebido2}
                          onChange={handleChange}
                          className={currencyInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Parcela 3 */}
              {Number(formData.quantidadeParcelas) >= 3 && (
                <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-200/50">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">3</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Terceira Parcela</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClasses}>Data Recebimento</label>
                      <input
                        type="date"
                        name="dataRecebimento3"
                        value={formData.dataRecebimento3}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Valor Recebido</label>
                      <div className={currencyInputContainer}>
                        <span className={currencyPrefix}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="valorRecebido3"
                          value={formData.valorRecebido3}
                          onChange={handleChange}
                          className={currencyInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parcela 4 */}
              {Number(formData.quantidadeParcelas) >= 4 && (
                <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-200/50">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">4</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Quarta Parcela</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClasses}>Data Recebimento</label>
                      <input
                        type="date"
                        name="dataRecebimento4"
                        value={formData.dataRecebimento4}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Valor Recebido</label>
                      <div className={currencyInputContainer}>
                        <span className={currencyPrefix}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="valorRecebido4"
                          value={formData.valorRecebido4}
                          onChange={handleChange}
                          className={currencyInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Parcela 5 */}
              {Number(formData.quantidadeParcelas) >= 5 && (
                <div className="group relative rounded-2xl border border-slate-100 bg-slate-50/30 p-5 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-200/50">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">5</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Quinta Parcela</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div>
                      <label className={labelClasses}>Data Recebimento</label>
                      <input
                        type="date"
                        name="dataRecebimento5"
                        value={formData.dataRecebimento5}
                        onChange={handleChange}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Valor Recebido</label>
                      <div className={currencyInputContainer}>
                        <span className={currencyPrefix}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="valorRecebido5"
                          value={formData.valorRecebido5}
                          onChange={handleChange}
                          className={currencyInput}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
