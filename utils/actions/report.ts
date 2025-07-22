"use server";

import { formatDateForReport, formatDateTimeForReport, formatTime, formatTimeWithSecondsForReport, translateStatus } from "../../lib/index";
import type { TaskWithTimeEntries, ReportFilters, ReportData, OvertimeDetail } from "@/utils/supabase/types";
import { createClient } from "../supabase/server";

export async function getTasksForReport(
    filters: ReportFilters
): Promise<ReportData> {
    try {
        const supabase = await createClient();
        console.log("Fetching tasks for report with filters:", filters);

        let tasksQuery = supabase
            .from("tasks")
            .select(
                `
                *,
                area:areas(*)
            `
            )
            .gte("created_at", `${filters.startDate}T00:00:00.000Z`)
            .lte("created_at", `${filters.endDate}T23:59:59.999Z`)
            .order("created_at", { ascending: false });

        if (filters.areaId) {
            tasksQuery = tasksQuery.eq("area_id", filters.areaId);
        }

        if (filters.status && filters.status !== "all") {
            tasksQuery = tasksQuery.eq("status", filters.status);
        }

        const { data: tasks, error: tasksError } = await tasksQuery;

        if (tasksError) {
            console.error("Error fetching tasks for report:", tasksError);
            throw new Error(`Erro ao buscar tarefas: ${tasksError.message}`);
        }

        let areaInfo = null;
        if (filters.areaId) {
            const { data: area } = await supabase
                .from("areas")
                .select("id, name, color")
                .eq("id", filters.areaId)
                .single();

            if (area) {
                areaInfo = area;
            }
        }

        if (!tasks || tasks.length === 0) {
            return {
                tasks: [],
                overtimeDetails: [],
                summary: {
                    totalTasks: 0,
                    totalTime: 0,
                    totalRegularTime: 0,
                    totalOvertimeTime: 0,
                    completedTasks: 0,
                    activeTasks: 0,
                    overtimeSessions: 0,
                },
                dateRange: {
                    start: filters.startDate,
                    end: filters.endDate,
                },
                areaInfo,
            };
        }

        const { data: timeEntries, error: entriesError } = await supabase
            .from("time_entries")
            .select("*")
            .in(
                "task_id",
                tasks.map((t) => t.id)
            )
            .gte("start_time", `${filters.startDate}T00:00:00.000Z`)
            .lte("start_time", `${filters.endDate}T23:59:59.999Z`)
            .order("start_time", { ascending: false });

        if (entriesError) {
            console.error(
                "Error fetching time entries for report:",
                entriesError
            );
        }

        const tasksWithTimeEntries: TaskWithTimeEntries[] = tasks.map(
            (task) => {
                const taskTimeEntries = (timeEntries || []).filter(
                    (entry) => entry.task_id === task.id
                );

                const totalTime = taskTimeEntries.reduce(
                    (sum, entry) => sum + (entry.duration_seconds || 0),
                    0
                );
                const totalRegular = taskTimeEntries.reduce(
                    (sum, entry) => sum + (entry.regular_seconds || 0),
                    0
                );
                const totalOvertime = taskTimeEntries.reduce(
                    (sum, entry) => sum + (entry.overtime_seconds || 0),
                    0
                );
                const activeEntry = taskTimeEntries.find(
                    (entry) => !entry.end_time
                );

                return {
                    ...task,
                    area: task.area,
                    time_entries: taskTimeEntries,
                    total_time_seconds: totalTime,
                    total_regular_seconds: totalRegular,
                    total_overtime_seconds: totalOvertime,
                    is_active: !!activeEntry,
                };
            }
        );

        // Generate detailed overtime information
        const overtimeDetails: OvertimeDetail[] = [];

        tasksWithTimeEntries.forEach((task) => {
            task.time_entries
                .filter(
                    (entry) =>
                        entry.overtime_seconds &&
                        entry.overtime_seconds > 0 &&
                        entry.end_time
                )
                .forEach((entry) => {
                    const startTime = new Date(entry.start_time);
                    const endTime = new Date(entry.end_time!);

                    // Calculate when overtime started
                    let overtimeStartTime: Date;
                    if (task.time_limit) {
                        const [hours, minutes] = task.time_limit
                            .split(":")
                            .map(Number);
                        overtimeStartTime = new Date(startTime);
                        overtimeStartTime.setHours(hours, minutes, 0, 0);

                        // If work started after the limit, overtime started immediately
                        if (startTime >= overtimeStartTime) {
                            overtimeStartTime = startTime;
                        }
                    } else {
                        overtimeStartTime = endTime; // No overtime if no limit
                    }

                    if (entry.overtime_seconds && entry.overtime_seconds > 0) {
                        overtimeDetails.push({
                            taskName: task.name,
                            taskDescription: task.description || "",
                            sessionStart: formatDateTimeForReport(
                                entry.start_time
                            ),
                            sessionEnd: formatDateTimeForReport(
                                entry.end_time!
                            ),
                            timeLimit: task.time_limit
                                ? task.time_limit.slice(0, 5)
                                : "Sem limite",
                            regularHours: entry.regular_seconds || 0,
                            overtimeStart: formatDateTimeForReport(
                                overtimeStartTime.toISOString()
                            ),
                            overtimeEnd: formatDateTimeForReport(
                                entry.end_time!
                            ),
                            overtimeHours: entry.overtime_seconds,
                            overtimeDuration: formatTime(
                                entry.overtime_seconds
                            ),
                            date: formatDateForReport(entry.start_time),
                            sessionStartTime: formatTimeWithSecondsForReport(
                                entry.start_time
                            ),
                            sessionEndTime: formatTimeWithSecondsForReport(
                                entry.end_time!
                            ),
                            overtimeStartTime: formatTimeWithSecondsForReport(
                                overtimeStartTime.toISOString()
                            ),
                            overtimeEndTime: formatTimeWithSecondsForReport(
                                entry.end_time!
                            ),
                        });
                    }
                });
        });

        // Sort overtime details by date and time
        overtimeDetails.sort(
            (a, b) =>
                new Date(b.sessionStart).getTime() -
                new Date(a.sessionStart).getTime()
        );

        // Calculate summary
        const summary = {
            totalTasks: tasksWithTimeEntries.length,
            totalTime: tasksWithTimeEntries.reduce(
                (sum, task) => sum + task.total_time_seconds,
                0
            ),
            totalRegularTime: tasksWithTimeEntries.reduce(
                (sum, task) => sum + task.total_regular_seconds,
                0
            ),
            totalOvertimeTime: tasksWithTimeEntries.reduce(
                (sum, task) => sum + task.total_overtime_seconds,
                0
            ),
            completedTasks: tasksWithTimeEntries.filter(
                (task) => task.status === "completed"
            ).length,
            activeTasks: tasksWithTimeEntries.filter((task) => task.is_active)
                .length,
            overtimeSessions: overtimeDetails.length,
        };

        return {
            tasks: tasksWithTimeEntries,
            overtimeDetails,
            summary,
            dateRange: {
                start: filters.startDate,
                end: filters.endDate,
            },
            areaInfo,
        };
    } catch (error) {
        console.error("Error in getTasksForReport:", error);
        throw error;
    }
}