import { formatDateForReport, formatDateTimeForReport, formatTime, formatTimeWithSecondsForReport, translateStatus } from "./utils";
import type { ReportData } from "@/utils/supabase/types";
import * as XLSX from "xlsx";

export function generateExcelReport(reportData: ReportData): ArrayBuffer {
    try {
        console.log("Generating Excel report with data:", reportData);

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Define color schemes and styles
        const colors = {
            primary: "4472C4", // Professional blue
            secondary: "70AD47", // Green
            accent: "E7E6E6", // Light gray
            warning: "FF9900", // Orange
            danger: "C5504B", // Red
            success: "70AD47", // Green
            dark: "2F4F4F", // Dark gray
            light: "F8F9FA", // Very light gray
        };

        // Create summary sheet with enhanced styling
        const summaryData = [
            ["RELATÓRIO DE CONTROLE DE TEMPO"],
            [""],
            ["📊 INFORMAÇÕES DO RELATÓRIO"],
            [
                "Período:",
                `${formatDateForReport(
                    reportData.dateRange.start
                )} a ${formatDateForReport(reportData.dateRange.end)}`,
            ],
            ["Data de Geração:", formatDateForReport(new Date().toISOString())],
            [
                "Horário de Geração:",
                formatTimeWithSecondsForReport(new Date().toISOString()),
            ],
            ...(reportData.areaInfo
                ? [["Área Filtrada:", reportData.areaInfo.name]]
                : []),
            [""],
            ["📈 RESUMO EXECUTIVO"],
            ["Total de Tarefas:", reportData.summary.totalTasks],
            ["Tarefas Concluídas:", reportData.summary.completedTasks],
            [""],
            ["⏰ ANÁLISE DE TEMPO"],
            [
                "Tempo Total Trabalhado:",
                formatTime(reportData.summary.totalTime),
            ],
            ["Tempo Regular:", formatTime(reportData.summary.totalRegularTime)],
            ["Horas Extras:", formatTime(reportData.summary.totalOvertimeTime)],
            [
                "% Horas Extras:",
                `${Math.round(
                    (reportData.summary.totalOvertimeTime /
                        reportData.summary.totalTime) *
                        100
                )}%`,
            ],
            ["Sessões com Hora Extra:", reportData.summary.overtimeSessions],
            [""],
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Apply styling to summary sheet
        applySummarySheetStyling(summarySheet, colors);

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "📊 Resumo Executivo"
        );

        // Create detailed overtime sheet with enhanced styling
        if (reportData.overtimeDetails.length > 0) {
            const overtimeHeaders = [
                "📅 Data",
                "📋 Tarefa",
                "📝 Descrição",
                "⏰ Limite",
                "🟢 INÍCIO SESSÃO",
                "📅 Data/Hora Início",
                "🕐 Horário",
                "🔴 FIM SESSÃO",
                "📅 Data/Hora Fim",
                "🕐 Horário",
                "🟠 INÍCIO HORA EXTRA",
                "📅 Data/Hora Início HE",
                "🕐 Horário HE",
                "🟠 FIM HORA EXTRA",
                "📅 Data/Hora Fim HE",
                "🕐 Horário HE",
                "⏱️ Duração HE",
                "📊 Regular (min)",
                "📊 Extra (min)",
            ];

            const overtimeData = [
                overtimeHeaders,
                ...reportData.overtimeDetails.map((detail) => [
                    detail.date,
                    detail.taskName,
                    detail.taskDescription || "—",
                    detail.timeLimit,
                    "INÍCIO →",
                    detail.sessionStart,
                    detail.sessionStartTime,
                    "FIM →",
                    detail.sessionEnd,
                    detail.sessionEndTime,
                    "HORA EXTRA →",
                    detail.overtimeStart,
                    detail.overtimeStartTime,
                    "FIM HE →",
                    detail.overtimeEnd,
                    detail.overtimeEndTime,
                    detail.overtimeDuration,
                    Math.round(detail.regularHours / 60),
                    Math.round(detail.overtimeHours / 60),
                ]),
                [],
                [
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "TOTAL:",
                    reportData.overtimeDetails.reduce(
                        (sum, d) => sum + Math.round(d.regularHours / 60),
                        0
                    ),
                    reportData.overtimeDetails.reduce(
                        (sum, d) => sum + Math.round(d.overtimeHours / 60),
                        0
                    ),
                ],
            ];

            const overtimeSheet = XLSX.utils.aoa_to_sheet(overtimeData);
            applyOvertimeSheetStyling(
                overtimeSheet,
                colors,
                reportData.overtimeDetails.length
            );
            XLSX.utils.book_append_sheet(
                workbook,
                overtimeSheet,
                "⏰ Detalhes Hora Extra"
            );
        }

        // Create enhanced tasks sheet
        const tasksHeaders = [
            "📋 Nome da Tarefa",
            "📝 Descrição",
            "🏢 Área",
            "🏷️ Status",
            "⏰ Limite",
            "📅 Criada em",
            "🕐 Horário",
            "⏱️ Tempo Total",
            "📊 Regular",
            "🟠 Extras",
            "📈 Sessões",
            "⚡ C/ Hora Extra",
        ];

        const tasksData = [
            tasksHeaders,
            ...reportData.tasks.map((task) => {
                return [
                    task.name,
                    task.description || "—",
                    task.area?.name || "—",
                    translateStatus(task.status),
                    task.time_limit
                        ? task.time_limit.slice(0, 5)
                        : "Sem limite",
                    formatDateForReport(task.created_at),
                    formatTimeWithSecondsForReport(task.created_at),
                    formatTime(task.total_time_seconds),
                    formatTime(task.total_regular_seconds),
                    formatTime(task.total_overtime_seconds),
                    task.time_entries.filter((entry) => entry.duration_seconds)
                        .length,
                    task.time_entries.filter(
                        (entry) =>
                            entry.overtime_seconds && entry.overtime_seconds > 0
                    ).length,
                ];
            }),
            [],
            [
                "TOTAIS:",
                "",
                "",
                "",
                "",
                "",
                "",
                formatTime(reportData.summary.totalTime),
                formatTime(reportData.summary.totalRegularTime),
                formatTime(reportData.summary.totalOvertimeTime),
                reportData.tasks.reduce(
                    (sum, t) =>
                        sum +
                        t.time_entries.filter((e) => e.duration_seconds).length,
                    0
                ),
                reportData.summary.overtimeSessions,
            ],
        ];

        const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
        applyTasksSheetStyling(tasksSheet, colors, reportData.tasks.length);
        XLSX.utils.book_append_sheet(
            workbook,
            tasksSheet,
            "📋 Análise de Tarefas"
        );

        // Create enhanced time entries sheet
        if (reportData.tasks.some((task) => task.time_entries.length > 0)) {
            const entriesHeaders = [
                "📅 Data",
                "📋 Tarefa",
                "🏢 Área",
                "🟢 INÍCIO",
                "📅 Data/Hora Início",
                "🕐 Horário",
                "🔴 FIM",
                "📅 Data/Hora Fim",
                "🕐 Horário",
                "⏱️ Duração",
                "📊 Regular",
                "🟠 Extras",
                "🏷️ Status",
                "⏰ Limite",
            ];

            const entriesData = [
                entriesHeaders,
                ...reportData.tasks.flatMap((task) =>
                    task.time_entries
                        .filter((entry) => entry.duration_seconds)
                        .map((entry) => {
                            return [
                                formatDateForReport(entry.start_time),
                                task.name,
                                task.area?.name || "—",
                                "INÍCIO →",
                                formatDateTimeForReport(entry.start_time),
                                formatTimeWithSecondsForReport(
                                    entry.start_time
                                ),
                                "FIM →",
                                entry.end_time
                                    ? formatDateTimeForReport(entry.end_time)
                                    : "Em andamento",
                                entry.end_time
                                    ? formatTimeWithSecondsForReport(
                                          entry.end_time
                                      )
                                    : "—",
                                formatTime(entry.duration_seconds || 0),
                                formatTime(entry.regular_seconds || 0),
                                formatTime(entry.overtime_seconds || 0),
                                translateStatus(task.status),
                                task.time_limit
                                    ? task.time_limit.slice(0, 5)
                                    : "Sem limite",
                            ];
                        })
                ),
            ];

            const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData);
            applyEntriesSheetStyling(
                entriesSheet,
                colors,
                entriesData.length - 1
            );
            XLSX.utils.book_append_sheet(
                workbook,
                entriesSheet,
                "📊 Todas as Sessões"
            );
        }

        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        return excelBuffer;
    } catch (error) {
        console.error("Error generating Excel report:", error);
        throw new Error("Erro ao gerar relatório Excel");
    }
}

function applySummarySheetStyling(sheet: any, colors: any) {
    // Set column widths
    sheet["!cols"] = [
        { width: 30 }, // Labels
        { width: 35 }, // Values
    ];

    // Apply styles to specific cells
    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:B25");

    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];

            if (!cell) continue;

            // Initialize cell style
            if (!cell.s) cell.s = {};

            // Title styling (row 0)
            if (row === 0) {
                cell.s = {
                    font: {
                        bold: true,
                        size: 16,
                        color: { rgb: colors.primary },
                    },
                    alignment: { horizontal: "center", vertical: "center" },
                    fill: { fgColor: { rgb: colors.light } },
                    border: {
                        top: { style: "thick", color: { rgb: colors.primary } },
                        bottom: {
                            style: "thick",
                            color: { rgb: colors.primary },
                        },
                    },
                };
            }
            // Section headers
            else if (
                cell.v &&
                typeof cell.v === "string" &&
                (cell.v.includes("📊") ||
                    cell.v.includes("📈") ||
                    cell.v.includes("⏰") ||
                    cell.v.includes("💰"))
            ) {
                cell.s = {
                    font: { bold: true, size: 12, color: { rgb: colors.dark } },
                    fill: { fgColor: { rgb: colors.accent } },
                    border: {
                        bottom: {
                            style: "medium",
                            color: { rgb: colors.primary },
                        },
                    },
                };
            }
            // Data rows
            else if (col === 0 && cell.v) {
                cell.s = {
                    font: { bold: true, size: 10 },
                    alignment: { horizontal: "right" },
                };
            } else if (col === 1 && cell.v) {
                cell.s = {
                    font: { size: 10 },
                    alignment: { horizontal: "left" },
                };
            }
        }
    }
}

function applyOvertimeSheetStyling(sheet: any, colors: any, dataRows: number) {
    // Set column widths (reduced from 20 to 19 columns)
    sheet["!cols"] = [
        { width: 12 },
        { width: 25 },
        { width: 30 },
        { width: 12 },
        { width: 15 },
        { width: 20 },
        { width: 12 },
        { width: 15 },
        { width: 20 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
        { width: 12 },
        { width: 18 },
        { width: 20 },
        { width: 12 },
        { width: 15 },
        { width: 12 },
        { width: 12 },
    ];

    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:S100");

    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];

            if (!cell) continue;
            if (!cell.s) cell.s = {};

            // Header row
            if (row === 0) {
                cell.s = {
                    font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: colors.warning } },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                    },
                    border: {
                        top: { style: "medium", color: { rgb: colors.dark } },
                        bottom: {
                            style: "medium",
                            color: { rgb: colors.dark },
                        },
                        left: { style: "thin", color: { rgb: colors.dark } },
                        right: { style: "thin", color: { rgb: colors.dark } },
                    },
                };
            }
            // Total row
            else if (row === dataRows + 2) {
                cell.s = {
                    font: { bold: true, size: 10 },
                    fill: { fgColor: { rgb: colors.accent } },
                    border: {
                        top: { style: "medium", color: { rgb: colors.dark } },
                    },
                };
            }
            // Data rows
            else if (row > 0 && row <= dataRows) {
                const isEvenRow = row % 2 === 0;
                cell.s = {
                    font: { size: 9 },
                    fill: {
                        fgColor: { rgb: isEvenRow ? colors.light : "FFFFFF" },
                    },
                    border: {
                        left: { style: "thin", color: { rgb: colors.accent } },
                        right: { style: "thin", color: { rgb: colors.accent } },
                    },
                    alignment: { vertical: "center" },
                };

                // Special styling for overtime columns
                if (col >= 10 && col <= 15) {
                    cell.s.fill = { fgColor: { rgb: "FFF2E6" } }; // Light orange for overtime
                }
            }
        }
    }
}

function applyTasksSheetStyling(sheet: any, colors: any, dataRows: number) {
    // Set column widths (updated to include area column)
    sheet["!cols"] = [
        { width: 30 },
        { width: 40 },
        { width: 20 }, // Area column
        { width: 15 },
        { width: 12 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 15 },
    ];

    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:L100");

    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];

            if (!cell) continue;
            if (!cell.s) cell.s = {};

            // Header row
            if (row === 0) {
                cell.s = {
                    font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: colors.primary } },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                    },
                    border: {
                        top: { style: "medium", color: { rgb: colors.dark } },
                        bottom: {
                            style: "medium",
                            color: { rgb: colors.dark },
                        },
                        left: { style: "thin", color: { rgb: colors.dark } },
                        right: { style: "thin", color: { rgb: colors.dark } },
                    },
                };
            }
            // Total row
            else if (row === dataRows + 2) {
                cell.s = {
                    font: { bold: true, size: 10 },
                    fill: { fgColor: { rgb: colors.secondary } },
                    alignment: { horizontal: "center" },
                    border: {
                        top: { style: "medium", color: { rgb: colors.dark } },
                    },
                };
            }
            // Data rows
            else if (row > 0 && row <= dataRows) {
                const isEvenRow = row % 2 === 0;
                cell.s = {
                    font: { size: 9 },
                    fill: {
                        fgColor: { rgb: isEvenRow ? colors.light : "FFFFFF" },
                    },
                    border: {
                        left: { style: "thin", color: { rgb: colors.accent } },
                        right: { style: "thin", color: { rgb: colors.accent } },
                    },
                    alignment: { vertical: "center" },
                };

                // Status column special colors
                if (col === 3 && cell.v) {
                    if (cell.v.includes("Concluída")) {
                        cell.s.fill = { fgColor: { rgb: "E6F7E6" } }; // Light green
                        cell.s.font = {
                            ...cell.s.font,
                            color: { rgb: colors.success },
                        };
                    } else if (cell.v.includes("Em Andamento")) {
                        cell.s.fill = { fgColor: { rgb: "E6F2FF" } }; // Light blue
                        cell.s.font = {
                            ...cell.s.font,
                            color: { rgb: colors.primary },
                        };
                    }
                }

                // Overtime column highlighting
                if (col === 9) {
                    cell.s.fill = { fgColor: { rgb: "FFF2E6" } }; // Light orange
                }
            }
        }
    }
}

function applyEntriesSheetStyling(sheet: any, colors: any, _dataRows: number) {
    // Set column widths (updated to include area column)
    sheet["!cols"] = [
        { width: 12 },
        { width: 25 },
        { width: 20 },
        { width: 12 },
        { width: 20 },
        { width: 12 },
        { width: 12 },
        { width: 20 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
    ];

    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:N1000");

    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];

            if (!cell) continue;
            if (!cell.s) cell.s = {};

            // Header row
            if (row === 0) {
                cell.s = {
                    font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: colors.secondary } },
                    alignment: {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: true,
                    },
                    border: {
                        top: { style: "medium", color: { rgb: colors.dark } },
                        bottom: {
                            style: "medium",
                            color: { rgb: colors.dark },
                        },
                        left: { style: "thin", color: { rgb: colors.dark } },
                        right: { style: "thin", color: { rgb: colors.dark } },
                    },
                };
            }
            // Data rows
            else if (row > 0) {
                const isEvenRow = row % 2 === 0;
                cell.s = {
                    font: { size: 9 },
                    fill: {
                        fgColor: { rgb: isEvenRow ? colors.light : "FFFFFF" },
                    },
                    border: {
                        left: { style: "thin", color: { rgb: colors.accent } },
                        right: { style: "thin", color: { rgb: colors.accent } },
                    },
                    alignment: { vertical: "center" },
                };

                // Start/End indicators
                if (col === 3 || col === 6) {
                    cell.s.font = { ...cell.s.font, bold: true };
                    if (col === 3) cell.s.font.color = { rgb: colors.success };
                    if (col === 6) cell.s.font.color = { rgb: colors.danger };
                }

                // Overtime column
                if (col === 11) {
                    cell.s.fill = { fgColor: { rgb: "FFF2E6" } };
                }
            }
        }
    }
}
