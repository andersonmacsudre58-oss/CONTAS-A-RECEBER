export interface FinancialEntry {
  faturadasERecebidas: string;
  processo: string;
  unidadeSaude: string;
  dataRecebimento: string;
  valorRecebido: number;
  fonte: "Estadual" | "Federal";
  tipoCusteio: "Regular" | "Investimento" | "Mutirão" | "Acordo Coletivo";
  mesFatura: string;
  conta: string;
  glosa: number;
  saldoAReceber: number;
}

export const FONTE_OPTIONS = ["Estadual", "Federal"] as const;
export const CUSTEIO_OPTIONS = ["Regular", "Investimento", "Mutirão", "Acordo Coletivo"] as const;
