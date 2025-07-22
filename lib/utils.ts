import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

export function formatDateBrasilia(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export function formatDateOnlyBrasilia(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

export function formatTimeOnlyBrasilia(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export function getCurrentBrasiliaTime(): Date {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
}

export function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Não Iniciada",
        in_progress: "Em Andamento",
        completed: "Concluída",
    };
    return statusMap[status] || status;
}

export function translateStatusToEnglish(status: string): string {
    const statusMap: Record<string, string> = {
        "Não Iniciada": "pending",
        "Em Andamento": "in_progress",
        Concluída: "completed",
    };
    return statusMap[status] || status;
}

export function downloadExcelFile(buffer: ArrayBuffer, filename: string) {
    try {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading Excel file:", error);
        throw new Error("Erro ao fazer download do arquivo");
    }
}

export function formatDateForReport(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

export function formatTimeWithSecondsForReport(dateString: string): string {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function formatDateTimeForReport(dateString: string): string {
    return new Date(dateString).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function generateReportFilename(
    startDate: string,
    endDate: string
): string {
    const start = formatDateForReport(startDate).replace(/\//g, "-");
    const end = formatDateForReport(endDate).replace(/\//g, "-");
    const timestamp = new Date().toISOString().slice(0, 10);
    return `relatorio-tempo-${start}_${end}_${timestamp}.xlsx`;
}