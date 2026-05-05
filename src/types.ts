export interface FinancialEntry {
  rowIndex?: number;
  processo: string;
  id: string;
  aditivos: string;
  mesFatura: string;
  dataOficio: string;
  taxa3: "Sim" | "Não";
  glosa: number | string;
  valorFaturado: number | string;
  dataRecebimento: string;
  valorRecebido: number | string;
  saldoAReceber: number | string;
  fonte: string;
  tipoConta: string;
  tipoCusteio: string;
  houveParcela: "Sim" | "Não";
  quantidadeParcelas?: number;
  dataRecebimento2?: string;
  valorRecebido2?: number | string;
  dataRecebimento3?: string;
  valorRecebido3?: number | string;
  dataRecebimento4?: string;
  valorRecebido4?: number | string;
  dataRecebimento5?: string;
  valorRecebido5?: number | string;
  tipoConta2?: string;
  tipoConta3?: string;
  tipoConta4?: string;
  tipoConta5?: string;
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
