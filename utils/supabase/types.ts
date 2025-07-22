export type Area = {
    id: string;
    name: string;
    description: string | null;
    color: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

export type Task = {
    id: string;
    name: string;
    description: string | null;
    status: "pending" | "in_progress" | "completed";
    time_limit: string | null; // Format: "HH:MM:SS"
    area_id: string | null;
    created_at: string;
    updated_at: string;
};

export type TimeEntry = {
    id: string;
    task_id: string;
    start_time: string;
    end_time: string | null;
    duration_seconds: number | null;
    regular_seconds: number | null;
    overtime_seconds: number | null;
    created_at: string;
};

export type OvertimeSummary = {
    id: string;
    date: string;
    total_overtime_seconds: number;
    created_at: string;
    updated_at: string;
};

export type TaskWithTimeEntries = Task & {
    area?: Area;
    time_entries: TimeEntry[];
    total_time_seconds: number;
    total_regular_seconds: number;
    total_overtime_seconds: number;
    is_active: boolean;
};

export interface ReportFilters {
    startDate: string;
    endDate: string;
    status?: string;
    includeTimeEntries?: boolean;
    areaId?: string | null;
}

export interface OvertimeDetail {
    taskName: string;
    taskDescription: string;
    sessionStart: string;
    sessionEnd: string;
    timeLimit: string;
    regularHours: number;
    overtimeStart: string;
    overtimeEnd: string;
    overtimeHours: number;
    overtimeDuration: string;
    date: string;
    sessionStartTime: string;
    sessionEndTime: string;
    overtimeStartTime: string;
    overtimeEndTime: string;
}

export interface ReportData {
    tasks: TaskWithTimeEntries[];
    overtimeDetails: OvertimeDetail[];
    summary: {
        totalTasks: number;
        totalTime: number;
        totalRegularTime: number;
        totalOvertimeTime: number;
        completedTasks: number;
        activeTasks: number;
        overtimeSessions: number;
    };
    dateRange: {
        start: string;
        end: string;
    };
    areaInfo?: {
        id: string;
        name: string;
        color: string;
    } | null;
}
