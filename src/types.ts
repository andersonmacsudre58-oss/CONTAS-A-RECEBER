export interface FinancialEntry {
  rowIndex?: number;
  processo: string;
  id: string;
  mesFatura: string;
  taxa3: "Sim" | "Não";
  glosa: number;
  valorFaturado: number;
  dataRecebimento: string;
  valorRecebido: number;
  saldoAReceber: number;
  fonte: string;
  tipoConta: string;
  tipoCusteio: string;
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

export const MESES_OPTIONS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
] as const;

export const FONTE_OPTIONS = ["SES", "SEAP", "IPREV", "SEGEP", "SEMU", "EMAP"] as const;

export const CONTA_OPTIONS = ["ESTADUAL", "FEDERAL"] as const;

export const CUSTEIO_OPTIONS = [
  "CUSTEIO REGULAR",
  "TESTAGEM/COVID-19",
  "PARCELA UNICA - INVESTIMENTO",
  "MUTIRÃO",
  "EMENDA PARLAMENTAR",
  "AMBULATORIO",
  "ACORDO COLETIVO"
] as const;
