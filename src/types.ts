export interface FinancialEntry {
  rowIndex?: number;
  processo: string;
  id: string;
  taxa3: "Sim" | "Não";
  glosa: number;
  valorFaturado: number;
  dataRecebimento: string;
  valorRecebido: number;
  saldoAReceber: number;
  houveParcela: "Sim" | "Não";
  quantidadeParcelas?: number;
  dataRecebimento2?: string;
  valorRecebido2?: number;
  dataRecebimento3?: string;
  valorRecebido3?: number;
  dataRecebimento4?: string;
  valorRecebido4?: number;
  dataRecebimento5?: string;
  valorRecebido5?: number;
}

export const SIM_NAO_OPTIONS = ["Não", "Sim"] as const;
