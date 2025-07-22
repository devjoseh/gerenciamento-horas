"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { generateReportFilename, downloadExcelFile, generateExcelReport, formatTime } from "@/lib/index";
import { FileSpreadsheet, Download, Calendar, AlertCircle, CheckCircle, Loader2, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Input, Label, Checkbox } from "@/components/index"
import type { ReportFilters, Area } from "@/utils/supabase/types";
import { getAreas, getTasksForReport } from "@/utils/actions/index";
import { useState, useEffect } from "react";

interface ReportGeneratorProps {
    selectedAreaId?: string | null;
}

export function ReportGenerator({ selectedAreaId }: ReportGeneratorProps) {
    const [open, setOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [reportPreview, setReportPreview] = useState<any>(null);
    const [areas, setAreas] = useState<Area[]>([]);

    const [filters, setFilters] = useState<
        ReportFilters & { areaId?: string | null }
    >({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 30 days ago
        endDate: new Date().toISOString().split("T")[0], // today
        status: "all",
        includeTimeEntries: true,
        areaId: selectedAreaId,
    });

    const loadAreas = async () => {
        try {
            const data = await getAreas();
            setAreas(data);
        } catch (error) {
            console.error("Erro ao carregar áreas:", error);
        }
    };

    useEffect(() => {
        if (open) {
            loadAreas();
        }
    }, [open]);

    useEffect(() => {
        setFilters((prev) => ({ ...prev, areaId: selectedAreaId }));
    }, [selectedAreaId]);

    const handleGeneratePreview = async () => {
        if (!filters.startDate || !filters.endDate) {
            setError("Por favor, selecione as datas de início e fim");
            return;
        }

        if (new Date(filters.startDate) > new Date(filters.endDate)) {
            setError("A data de início deve ser anterior à data de fim");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setSuccess(null);
        setReportPreview(null);

        try {
            console.log("Generating report preview with filters:", filters);
            const reportData = await getTasksForReport(filters);
            setReportPreview(reportData);

            if (reportData.tasks.length === 0) {
                setError("Nenhuma tarefa encontrada no período selecionado");
            } else {
                const selectedArea = areas.find(
                    (area) => area.id === filters.areaId
                );
                const areaText = selectedArea
                    ? ` na área "${selectedArea.name}"`
                    : "";
                setSuccess(
                    `Relatório preparado com ${reportData.tasks.length} tarefas e ${reportData.overtimeDetails.length} sessões com hora extra${areaText}`
                );
            }
        } catch (error) {
            console.error("Error generating report preview:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao gerar prévia do relatório"
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!reportPreview) {
            await handleGeneratePreview();
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            console.log("Generating Excel file...");
            const excelBuffer = generateExcelReport(reportPreview);
            const filename = generateReportFilename(
                filters.startDate,
                filters.endDate
            );

            downloadExcelFile(excelBuffer, filename);
            setSuccess(`Relatório ${filename} baixado com sucesso!`);

            // Close dialog after successful download
            setTimeout(() => {
                setOpen(false);
                setReportPreview(null);
                setSuccess(null);
            }, 2000);
        } catch (error) {
            console.error("Error downloading report:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao baixar relatório"
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setError(null);
            setSuccess(null);
            setReportPreview(null);
        }
    };

    const selectedArea = areas.find((area) => area.id === filters.areaId);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                    <FileSpreadsheet className="h-4 w-4" />
                    Gerar Relatório Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Gerar Relatório de Controle de Tempo
                    </DialogTitle>
                    <DialogDescription>
                        Crie um relatório detalhado em Excel com dados das suas
                        tarefas, incluindo análise completa de horas extras.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        {success}
                    </div>
                )}

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="startDate"
                                className="flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Data de Início
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        startDate: e.target.value,
                                    }))
                                }
                                disabled={isGenerating}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="endDate"
                                className="flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Data de Fim
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        endDate: e.target.value,
                                    }))
                                }
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="areaId"
                            className="flex items-center gap-2"
                        >
                            <Building2 className="h-4 w-4" />
                            Filtrar por Área
                        </Label>
                        <Select
                            value={filters.areaId || "all"}
                            onValueChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    areaId: value === "all" ? null : value,
                                }))
                            }
                            disabled={isGenerating}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma área">
                                    {selectedArea ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        selectedArea.color,
                                                }}
                                            />
                                            {selectedArea.name}
                                        </div>
                                    ) : (
                                        "Todas as Áreas"
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                                        Todas as Áreas
                                    </div>
                                </SelectItem>
                                {areas.map((area) => (
                                    <SelectItem key={area.id} value={area.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: area.color,
                                                }}
                                            />
                                            {area.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Filtrar por Status</Label>
                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    status: value,
                                }))
                            }
                            disabled={isGenerating}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todas as Tarefas
                                </SelectItem>
                                <SelectItem value="pending">
                                    Não Iniciadas
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    Em Andamento
                                </SelectItem>
                                <SelectItem value="completed">
                                    Concluídas
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="includeTimeEntries"
                            checked={filters.includeTimeEntries}
                            onCheckedChange={(checked) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    includeTimeEntries: checked as boolean,
                                }))
                            }
                            disabled={isGenerating}
                        />
                        <Label htmlFor="includeTimeEntries" className="text-sm">
                            Incluir aba com todas as sessões de trabalho
                        </Label>
                    </div>
                </div>

                {reportPreview && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Prévia do Relatório
                            </CardTitle>
                            <CardDescription>
                                Período:{" "}
                                {new Date(
                                    reportPreview.dateRange.start
                                ).toLocaleDateString("pt-BR")}{" "}
                                a{" "}
                                {new Date(
                                    reportPreview.dateRange.end
                                ).toLocaleDateString("pt-BR")}
                                {selectedArea &&
                                    ` • Área: ${selectedArea.name}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="font-medium">
                                        � Tarefas:{" "}
                                        {reportPreview.summary.totalTasks}
                                    </p>
                                    <p>
                                        ✅ Concluídas:{" "}
                                        {reportPreview.summary.completedTasks}
                                    </p>
                                    <p>
                                        � Ativas:{" "}
                                        {reportPreview.summary.activeTasks}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">
                                        ⏰ Tempo Total:{" "}
                                        {formatTime(
                                            reportPreview.summary.totalTime
                                        )}
                                    </p>
                                    <p className="text-orange-600 font-medium">
                                        ⏱️ Horas Extras:{" "}
                                        {formatTime(
                                            reportPreview.summary
                                                .totalOvertimeTime
                                        )}
                                    </p>
                                    <p>
                                        � Sessões c/ Hora Extra:{" "}
                                        {reportPreview.summary.overtimeSessions}
                                    </p>
                                </div>
                            </div>

                            {reportPreview.overtimeDetails.length > 0 && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                    <h4 className="font-medium text-orange-900 mb-2">
                                        � Detalhes das Horas Extras
                                    </h4>
                                    <div className="space-y-1 text-sm text-orange-800 max-h-32 overflow-y-auto">
                                        {reportPreview.overtimeDetails
                                            .slice(0, 3)
                                            .map(
                                                (
                                                    detail: any,
                                                    index: number
                                                ) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between"
                                                    >
                                                        <span>
                                                            {detail.taskName}
                                                        </span>
                                                        <span className="font-medium">
                                                            {
                                                                detail.overtimeDuration
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        {reportPreview.overtimeDetails.length >
                                            3 && (
                                            <p className="text-xs">
                                                ... e mais{" "}
                                                {reportPreview.overtimeDetails
                                                    .length - 3}{" "}
                                                sessões
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                <h4 className="font-medium text-blue-900 mb-2">
                                    � O relatório incluirá:
                                </h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>
                                        • <strong>Resumo:</strong> Estatísticas
                                        gerais do período
                                    </li>
                                    <li>
                                        • <strong>Detalhes Hora Extra:</strong>{" "}
                                        Quando cada hora extra começou e
                                        terminou
                                    </li>
                                    <li>
                                        • <strong>Tarefas:</strong> Informações
                                        completas de cada tarefa
                                    </li>
                                    {filters.includeTimeEntries && (
                                        <li>
                                            • <strong>Todas as Sessões:</strong>{" "}
                                            Histórico completo de trabalho
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleGeneratePreview}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Gerando Prévia...
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Gerar Prévia
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleDownloadReport}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Baixando...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Baixar Excel
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
