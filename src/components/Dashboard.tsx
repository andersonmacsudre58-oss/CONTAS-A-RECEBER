import { FinancialEntry } from "../types";
import { formatCurrency } from "../lib/utils";
import { Table, ArrowUpDown, Search, Edit2, Trash2, Download, Database, RefreshCw, FileSpreadsheet, Upload } from "lucide-react";
import { useState, useRef } from "react";
import React from "react";
import * as XLSX from "xlsx";
import { cn } from "../lib/utils";
import axios from "axios";

interface DashboardProps {
  entries: FinancialEntry[];
  onEdit: (entry: FinancialEntry) => void;
  onDelete: (rowIndex: number) => void;
  onRefresh: () => Promise<void>;
}

export default function Dashboard({ entries, onEdit, onDelete, onRefresh }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsRestoring(true);
        const content = e.target?.result as string;
        const backupData = JSON.parse(content) as FinancialEntry[];

        if (!Array.isArray(backupData)) throw new Error("Formato de backup inválido.");

        if (confirm(`Deseja restaurar ${backupData.length} lançamentos? Isso adicionará os dados à planilha atual.`)) {
          for (const entry of backupData) {
            const values = [
              entry.processo,
              entry.id,
              entry.taxa3,
              entry.glosa,
              entry.valorFaturado,
              entry.dataRecebimento,
              entry.valorRecebido,
              entry.saldoAReceber,
              entry.fonte,
              entry.tipoCusteio,
              entry.houveParcela,
              entry.quantidadeParcelas || 1,
              entry.dataRecebimento2 || "",
              entry.valorRecebido2 || 0,
              entry.dataRecebimento3 || "",
              entry.valorRecebido3 || 0,
              entry.dataRecebimento4 || "",
              entry.valorRecebido4 || 0,
              entry.dataRecebimento5 || "",
              entry.valorRecebido5 || 0,
              new Date().toISOString(),
            ];
            await axios.post("/api/sheets/append", { values });
          }
          alert("Restauração concluída com sucesso!");
          await onRefresh();
        }
      } catch (error) {
        console.error("Erro ao restaurar backup:", error);
        alert("Erro ao processar o arquivo de backup. Verifique se é um arquivo JSON válido.");
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(entries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lançamentos");
    XLSX.writeFile(workbook, `Contas_a_Receber_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_contas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const filteredEntries = entries.filter((entry) =>
    Object.values(entry).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Table className="text-blue-600" />
            Últimos Lançamentos
          </h2>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleRestoreClick}
              disabled={isRestoring}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              title="Restaurar dados de um backup JSON"
            >
              <Upload size={14} className={cn(isRestoring && "animate-spin")} />
              {isRestoring ? "Restaurando..." : "Restaurar"}
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              title="Exportar para Excel"
            >
              <FileSpreadsheet size={14} className="text-green-600" />
              Excel
            </button>
            <button
              onClick={handleBackupJSON}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              title="Backup em JSON"
            >
              <Database size={14} className="text-blue-600" />
              Backup
            </button>
          </div>
        </div>
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
                <th className="px-6 py-4">Processo</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Taxa 3%</th>
                <th className="px-6 py-4">Glosa</th>
                <th className="px-6 py-4">Vlr Faturado</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Vlr Recebido</th>
                <th className="px-6 py-4">Saldo</th>
                <th className="px-6 py-4">Fonte</th>
                <th className="px-6 py-4">Custeio</th>
                <th className="px-6 py-4">Parcela?</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {entry.processo}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        entry.taxa3 === "Sim" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {entry.taxa3}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{formatCurrency(entry.glosa)}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-blue-600">
                      {formatCurrency(entry.valorFaturado)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {entry.dataRecebimento ? new Date(entry.dataRecebimento).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(entry.valorRecebido)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-red-600">
                      {formatCurrency(entry.saldoAReceber)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.fonte}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.tipoCusteio}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.houveParcela}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">{entry.houveParcela === "Sim" ? entry.quantidadeParcelas : "-"}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(entry)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => entry.rowIndex && onDelete(entry.rowIndex)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
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
