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
  const formatInitialData = (data: FinancialEntry): FinancialEntry => {
    return {
      ...data,
      valorFaturado: formatDisplay(data.valorFaturado),
      glosa: formatDisplay(data.glosa),
      valorRecebido: formatDisplay(data.valorRecebido),
      valorRecebido2: formatDisplay(data.valorRecebido2),
      valorRecebido3: formatDisplay(data.valorRecebido3),
      valorRecebido4: formatDisplay(data.valorRecebido4),
      valorRecebido5: formatDisplay(data.valorRecebido5),
      saldoAReceber: formatDisplay(data.saldoAReceber),
    };
  };

  const [formData, setFormData] = useState<FinancialEntry>(initialData ? formatInitialData(initialData) : {
    processo: "",
    id: "",
    aditivos: "",
    mesFatura: MESES_OPTIONS[new Date().getMonth()],
    dataOficio: "",
    taxa3: "Não",
    glosa: "0,00",
    valorFaturado: "0,00",
    dataRecebimento: new Date().toISOString().split("T")[0],
    valorRecebido: "0,00",
    saldoAReceber: "0,00",
    fonte: "SES",
    tipoConta: "ESTADUAL",
    tipoCusteio: "CUSTEIO REGULAR",
    houveParcela: "Não",
    quantidadeParcelas: 1,
    dataRecebimento2: "",
    valorRecebido2: "0,00",
    dataRecebimento3: "",
    valorRecebido3: "0,00",
    dataRecebimento4: "",
    valorRecebido4: "0,00",
    dataRecebimento5: "",
    valorRecebido5: "0,00",
    tipoConta2: "ESTADUAL",
    tipoConta3: "ESTADUAL",
    tipoConta4: "ESTADUAL",
    tipoConta5: "ESTADUAL",
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(formatInitialData(initialData));
    }
  }, [initialData]);

  const parseValue = (val: any): number => {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === "number") return val;
    // Remove todos os pontos (milhares) e substitui a vírgula por ponto (decimal)
    const clean = String(val).replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  };

  const formatDisplay = (val: any): string => {
    const num = parseValue(val);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Real-time calculation of Saldo a Receber
  useEffect(() => {
    const faturado = parseValue(formData.valorFaturado);
    const glosa = parseValue(formData.glosa);
    const rec1 = parseValue(formData.valorRecebido);
    const rec2 = formData.houveParcela === "Sim" ? parseValue(formData.valorRecebido2) : 0;
    const rec3 = formData.houveParcela === "Sim" ? parseValue(formData.valorRecebido3) : 0;
    const rec4 = formData.houveParcela === "Sim" ? parseValue(formData.valorRecebido4) : 0;
    const rec5 = formData.houveParcela === "Sim" ? parseValue(formData.valorRecebido5) : 0;

    const totalRecebido = rec1 + rec2 + rec3 + rec4 + rec5;
    const saldo = Number((faturado - glosa - totalRecebido).toFixed(2));

    if (parseValue(formData.saldoAReceber) !== saldo) {
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

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Permitir dígitos, pontos (milhares) e UMA vírgula (decimal)
    // Regex: permite números, múltiplos pontos e uma vírgula opcional
    if (value === "" || /^-?[\d.]*,?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== "") {
      setFormData(prev => ({
        ...prev,
        [name]: formatDisplay(value)
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert string inputs back to numbers for submission
    const submissionData: FinancialEntry = {
      ...formData,
      valorFaturado: parseValue(formData.valorFaturado),
      glosa: parseValue(formData.glosa),
      valorRecebido: parseValue(formData.valorRecebido),
      valorRecebido2: parseValue(formData.valorRecebido2),
      valorRecebido3: parseValue(formData.valorRecebido3),
      valorRecebido4: parseValue(formData.valorRecebido4),
      valorRecebido5: parseValue(formData.valorRecebido5),
      saldoAReceber: parseValue(formData.saldoAReceber),
    };

    try {
      await onSubmit(submissionData);
      // Reset form or show success
      setFormData({
        processo: "",
        id: "",
        aditivos: "",
        mesFatura: MESES_OPTIONS[new Date().getMonth()],
        dataOficio: "",
        taxa3: "Não",
        glosa: "0,00",
        valorFaturado: "0,00",
        dataRecebimento: new Date().toISOString().split("T")[0],
        valorRecebido: "0,00",
        saldoAReceber: "0,00",
        fonte: "SES",
        tipoConta: "ESTADUAL",
        tipoCusteio: "CUSTEIO REGULAR",
        houveParcela: "Não",
        quantidadeParcelas: 1,
        dataRecebimento2: "",
        valorRecebido2: "0,00",
        dataRecebimento3: "",
        valorRecebido3: "0,00",
        dataRecebimento4: "",
        valorRecebido4: "0,00",
        dataRecebimento5: "",
        valorRecebido5: "0,00",
        tipoConta2: "ESTADUAL",
        tipoConta3: "ESTADUAL",
        tipoConta4: "ESTADUAL",
        tipoConta5: "ESTADUAL",
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
              type="text"
              name="valorFaturado"
              value={formData.valorFaturado}
              onChange={handleNumberChange}
              onBlur={handleBlur}
              className={currencyInput}
              placeholder="0,00"
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
              type="text"
              name="glosa"
              value={formData.glosa}
              onChange={handleNumberChange}
              onBlur={handleBlur}
              className={currencyInput}
              placeholder="0,00"
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
              type="text"
              name="valorRecebido"
              value={formData.valorRecebido}
              onChange={handleNumberChange}
              onBlur={handleBlur}
              className={currencyInput}
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Saldo a Receber */}
        <div>
          <label className={labelClasses}>Saldo a Receber (Calculado)</label>
          <div className={currencyInputContainer}>
            <span className={currencyPrefix}>R$</span>
            <input
              type="text"
              name="saldoAReceber"
              value={typeof formData.saldoAReceber === 'number' ? formatDisplay(formData.saldoAReceber) : formData.saldoAReceber}
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
                          type="text"
                          name="valorRecebido2"
                          value={formData.valorRecebido2}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          className={currencyInput}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Tipo de Conta</label>
                      <select
                        name="tipoConta2"
                        value={formData.tipoConta2}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        {CONTA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
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
                          type="text"
                          name="valorRecebido3"
                          value={formData.valorRecebido3}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          className={currencyInput}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Tipo de Conta</label>
                      <select
                        name="tipoConta3"
                        value={formData.tipoConta3}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        {CONTA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
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
                          type="text"
                          name="valorRecebido4"
                          value={formData.valorRecebido4}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          className={currencyInput}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Tipo de Conta</label>
                      <select
                        name="tipoConta4"
                        value={formData.tipoConta4}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        {CONTA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
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
                          type="text"
                          name="valorRecebido5"
                          value={formData.valorRecebido5}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          className={currencyInput}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Tipo de Conta</label>
                      <select
                        name="tipoConta5"
                        value={formData.tipoConta5}
                        onChange={handleChange}
                        className={inputClasses}
                      >
                        {CONTA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
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
