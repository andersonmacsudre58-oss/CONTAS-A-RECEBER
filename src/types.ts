export interface FinancialEntry {
  rowIndex?: number;
  processo: string;
  id: string;
  taxa3: "Sim" | "Não";
  fonte: "Estadual" | "Federal";
  custeio: "Regular" | "Investimento" | "Mutirão" | "Global" | "Acordo Coletivo";
  conta: string;
  glosa: number;
  valorFaturado: number;
  dataRecebimento: string;
  valorRecebido: number;
  saldoAReceber: number;
  houveParcela: "Sim" | "Não";
  dataRecebimento2?: string;
  valorRecebido2?: number;
  dataRecebimento3?: string;
  valorRecebido3?: number;
}

export const FONTE_OPTIONS = ["Estadual", "Federal"] as const;
export const CUSTEIO_OPTIONS = ["Regular", "Investimento", "Mutirão", "Global", "Acordo Coletivo"] as const;
export const SIM_NAO_OPTIONS = ["Não", "Sim"] as const;
