import { FinancialEntry } from "../types";
import { formatCurrency } from "../lib/utils";
import { Table, ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
  entries: FinancialEntry[];
}

export default function Dashboard({ entries }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEntries = entries.filter((entry) =>
    Object.values(entry).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Table className="text-blue-600" />
          Últimos Lançamentos
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar lançamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Faturada/Recebida</th>
                <th className="px-6 py-4">Processo</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Fonte</th>
                <th className="px-6 py-4">Custeio</th>
                <th className="px-6 py-4">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {entry.faturadasERecebidas}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.processo}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.unidadeSaude}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {new Date(entry.dataRecebimento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(entry.valorRecebido)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        entry.fonte === "Federal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {entry.fonte}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.tipoCusteio}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-red-600">
                      {formatCurrency(entry.saldoAReceber)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
