"use client";

import { generateExcelReport, formatTime, downloadExcelFile, generateReportFilename } from "@/lib/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Calendar, TrendingUp, Download, RefreshCw } from "lucide-react";
import { ReportGenerator } from "./report-generator";
import { getTasksForReport } from "@/utils/actions";
import { Button, Badge } from "@/components/index";
import { useState, useEffect } from "react";

interface ReportsDashboardProps {
    selectedAreaId?: string | null;
}

export function ReportsDashboard({ selectedAreaId }: ReportsDashboardProps) {
    const [quickStats, setQuickStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadQuickStats = async () => {
        try {
            setIsLoading(true);

            // Get stats for different periods
            const today = new Date().toISOString().split("T")[0];
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

            const [thisWeek, thisMonth] = await Promise.all([
                getTasksForReport({
                    startDate: weekAgo,
                    endDate: today,
                    areaId: selectedAreaId,
                }),
                getTasksForReport({
                    startDate: monthAgo,
                    endDate: today,
                    areaId: selectedAreaId,
                }),
            ]);

            setQuickStats({
                thisWeek,
                thisMonth,
            });
        } catch (error) {
            console.error("Error loading quick stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQuickStats();
    }, [selectedAreaId]);

    const quickReportButtons = [
        {
            label: "Esta Semana",
            description: "Últimos 7 dias",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            icon: Calendar,
        },
        {
            label: "Este Mês",
            description: "Últimos 30 dias",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            icon: Calendar,
        },
        {
            label: "Trimestre",
            description: "Últimos 90 dias",
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            icon: TrendingUp,
        },
    ];

    const handleQuickReport = async (startDate: string, endDate: string) => {
        try {
            const reportData = await getTasksForReport({
                startDate,
                endDate,
                areaId: selectedAreaId,
            });

            const excelBuffer = generateExcelReport(reportData);
            const filename = generateReportFilename(startDate, endDate);
            downloadExcelFile(excelBuffer, filename);
        } catch (error) {
            console.error("Error generating quick report:", error);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Relatórios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Relatórios de Controle de Tempo
                            </CardTitle>
                            <CardDescription>
                                Gere relatórios detalhados em Excel com análise
                                completa de horas extras
                                {selectedAreaId && " para a área selecionada"}
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={loadQuickStats}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Quick Stats */}
                    {quickStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">
                                    📅 Esta Semana
                                </h4>
                                <div className="space-y-1 text-sm text-blue-800">
                                    <p>
                                        {quickStats.thisWeek.summary.totalTasks}{" "}
                                        tarefas
                                    </p>
                                    <p>
                                        {formatTime(
                                            quickStats.thisWeek.summary
                                                .totalTime
                                        )}{" "}
                                        trabalhadas
                                    </p>
                                    <p className="font-medium">
                                        {formatTime(
                                            quickStats.thisWeek.summary
                                                .totalOvertimeTime
                                        )}{" "}
                                        extras
                                    </p>
                                    <p>
                                        {
                                            quickStats.thisWeek.summary
                                                .overtimeSessions
                                        }{" "}
                                        sessões c/ hora extra
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">
                                    📊 Este Mês
                                </h4>
                                <div className="space-y-1 text-sm text-green-800">
                                    <p>
                                        {
                                            quickStats.thisMonth.summary
                                                .totalTasks
                                        }{" "}
                                        tarefas
                                    </p>
                                    <p>
                                        {formatTime(
                                            quickStats.thisMonth.summary
                                                .totalTime
                                        )}{" "}
                                        trabalhadas
                                    </p>
                                    <p className="font-medium">
                                        {formatTime(
                                            quickStats.thisMonth.summary
                                                .totalOvertimeTime
                                        )}{" "}
                                        extras
                                    </p>
                                    <p>
                                        {
                                            quickStats.thisMonth.summary
                                                .overtimeSessions
                                        }{" "}
                                        sessões c/ hora extra
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Generation Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                                Gerar Relatórios
                            </h3>
                            <ReportGenerator selectedAreaId={selectedAreaId} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickReportButtons.map((button, index) => (
                                <Card
                                    key={index}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <button.icon className="h-5 w-5 text-blue-600" />
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                Rápido
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium mb-1">
                                            {button.label}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {button.description}
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full bg-transparent"
                                            onClick={() =>
                                                handleQuickReport(
                                                    button.startDate,
                                                    button.endDate
                                                )
                                            }
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Baixar Excel
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
