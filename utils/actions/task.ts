"use server";

import { createClient } from "../supabase/server";
import { OvertimeSummary, Task, TaskWithTimeEntries, TimeEntry } from "../supabase/types";

export async function createTask(
    name: string,
    description: string,
    timeLimit?: string,
    areaId?: string
) {
    try {
        const supabase = await createClient();
        console.log("Creating task with data:", {
            name,
            description,
            timeLimit,
            areaId,
        });

        if (!name || name.trim().length === 0) {
            throw new Error("Nome da tarefa é obrigatório");
        }

        // If no area specified, use default area
        let finalAreaId = areaId;
        if (!finalAreaId) {
            const { data: defaultArea } = await supabase
                .from("areas")
                .select("id")
                .eq("is_default", true)
                .single();

            if (defaultArea) {
                finalAreaId = defaultArea.id;
            }
        }

        const taskData = {
            name: name.trim(),
            description: description.trim() || null,
            status: "pending" as const,
            time_limit: timeLimit || null,
            area_id: finalAreaId,
        };

        console.log("Task data to insert:", taskData);

        const { data, error } = await supabase
            .from("tasks")
            .insert([taskData])
            .select()
            .single();

        if (error) {
            console.error("Supabase error creating task:", error);
            throw new Error(`Erro ao criar tarefa: ${error.message}`);
        }

        if (!data) {
            throw new Error("Nenhum dado retornado após criar a tarefa");
        }

        console.log("Task created successfully:", data);
        return data;
    } catch (error) {
        console.error("Error in createTask function:", error);
        throw error;
    }
}

export async function updateTask(
    taskId: string,
    updates: {
        name?: string;
        description?: string;
        status?: Task["status"];
        time_limit?: string | null;
        area_id?: string | null;
    }
) {
    try {
        const supabase = await createClient();
        console.log("Updating task with data:", { taskId, updates });

        if (
            updates.name !== undefined &&
            (!updates.name || updates.name.trim().length === 0)
        ) {
            throw new Error("Nome da tarefa é obrigatório");
        }

        // Prepare update data, only including defined fields
        const updateData: any = {};

        if (updates.name !== undefined) {
            updateData.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            updateData.description = updates.description.trim() || null;
        }

        if (updates.status !== undefined) {
            updateData.status = updates.status;
        }

        if (updates.time_limit !== undefined) {
            updateData.time_limit = updates.time_limit;
        }

        if (updates.area_id !== undefined) {
            updateData.area_id = updates.area_id;
        }

        console.log("Prepared update data:", updateData);

        const { data, error } = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", taskId)
            .select()
            .single();

        if (error) {
            console.error("Supabase error updating task:", error);
            throw new Error(`Erro ao atualizar tarefa: ${error.message}`);
        }

        if (!data) {
            throw new Error("Nenhum dado retornado após atualizar a tarefa");
        }

        console.log("Task updated successfully:", data);
        return data;
    } catch (error) {
        console.error("Error in updateTask function:", error);
        throw error;
    }
}

export async function getTasks(
    areaId?: string
): Promise<TaskWithTimeEntries[]> {
    try {
        const supabase = await createClient();
        console.log("Fetching tasks for area:", areaId || "all");

        let tasksQuery = supabase
            .from("tasks")
            .select(
                `
                *,
                area:areas(*)
            `
            )
            .order("created_at", { ascending: false });

        // Filter by area if specified
        if (areaId) {
            tasksQuery = tasksQuery.eq("area_id", areaId);
        }

        const { data: tasks, error: tasksError } = await tasksQuery;

        if (tasksError) {
            console.error("Error fetching tasks:", tasksError);
            throw new Error(`Erro ao buscar tarefas: ${tasksError.message}`);
        }

        console.log("Tasks found:", tasks?.length || 0);

        if (!tasks || tasks.length === 0) {
            return [];
        }

        const { data: timeEntries, error: entriesError } = await supabase
            .from("time_entries")
            .select("*")
            .order("start_time", { ascending: false });

        if (entriesError) {
            console.error("Error fetching time entries:", entriesError);
        }

        console.log("Time entries found:", timeEntries?.length || 0);

        const tasksWithTimeEntries: TaskWithTimeEntries[] = tasks.map(
            (task) => {
                const taskTimeEntries = (timeEntries || []).filter(
                    (entry) => entry.task_id === task.id
                );

                const totalTime = taskTimeEntries.reduce(
                    (sum: number, entry: TimeEntry) => {
                        return sum + (entry.duration_seconds || 0);
                    },
                    0
                );

                const totalRegular = taskTimeEntries.reduce(
                    (sum: number, entry: TimeEntry) => {
                        return sum + (entry.regular_seconds || 0);
                    },
                    0
                );

                const totalOvertime = taskTimeEntries.reduce(
                    (sum: number, entry: TimeEntry) => {
                        return sum + (entry.overtime_seconds || 0);
                    },
                    0
                );

                const activeEntry = taskTimeEntries.find(
                    (entry: TimeEntry) => !entry.end_time
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

        return tasksWithTimeEntries;
    } catch (error) {
        console.error("Error in getTasks:", error);
        throw error;
    }
}

function calculateOvertimeSeconds(
    startTime: Date,
    endTime: Date,
    timeLimit: string | null
): { regular: number; overtime: number } {
    if (!timeLimit) {
        const totalSeconds = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000
        );
        return { regular: totalSeconds, overtime: 0 };
    }

    // Parse time limit (format: "HH:MM:SS" or "HH:MM")
    const [hours, minutes, seconds = 0] = timeLimit.split(":").map(Number);

    // Create limit time for the same date as start time
    const limitTime = new Date(startTime);
    limitTime.setHours(hours, minutes, seconds, 0);

    console.log("Calculating overtime:", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        limitTime: limitTime.toISOString(),
        timeLimit,
    });

    // If work ended before the limit, no overtime
    if (endTime <= limitTime) {
        const totalSeconds = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000
        );
        return { regular: totalSeconds, overtime: 0 };
    }

    // If work started after the limit, all is overtime
    if (startTime >= limitTime) {
        const totalSeconds = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000
        );
        return { regular: 0, overtime: totalSeconds };
    }

    // Work spans across the limit
    const regularSeconds = Math.round(
        (limitTime.getTime() - startTime.getTime()) / 1000
    );
    const overtimeSeconds = Math.round(
        (endTime.getTime() - limitTime.getTime()) / 1000
    );

    return {
        regular: Math.max(0, regularSeconds),
        overtime: Math.max(0, overtimeSeconds),
    };
}

export async function stopTimeTracking(taskId: string) {
    try {
        const supabase = await createClient();
        console.log("Stopping time tracking for task:", taskId);

        // Get the task to check time limit
        const { data: task } = await supabase
            .from("tasks")
            .select("time_limit")
            .eq("id", taskId)
            .single();

        const { data: activeEntry } = await supabase
            .from("time_entries")
            .select("*")
            .eq("task_id", taskId)
            .is("end_time", null)
            .single();

        if (!activeEntry) {
            console.log("No active time tracking found for task:", taskId);
            return null;
        }

        const endTime = new Date();
        const startTime = new Date(activeEntry.start_time);
        const totalDurationSeconds = Math.round(
            (endTime.getTime() - startTime.getTime()) / 1000
        );

        // Calculate regular and overtime hours
        const { regular, overtime } = calculateOvertimeSeconds(
            startTime,
            endTime,
            task?.time_limit || null
        );

        console.log("Time calculation result:", {
            totalDurationSeconds,
            regular,
            overtime,
            timeLimit: task?.time_limit,
        });

        const { data, error } = await supabase
            .from("time_entries")
            .update({
                end_time: endTime.toISOString(),
                duration_seconds: totalDurationSeconds,
                regular_seconds: regular,
                overtime_seconds: overtime,
            })
            .eq("id", activeEntry.id)
            .select()
            .single();

        if (error) {
            console.error("Error stopping time tracking:", error);
            throw new Error(`Erro ao parar rastreamento: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error in stopTimeTracking function:", error);
        throw error;
    }
}

export async function getOvertimeSummary(): Promise<OvertimeSummary[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("overtime_summary")
            .select("*")
            .order("date", { ascending: false })
            .limit(30); // Last 30 days

        if (error) {
            console.error("Error fetching overtime summary:", error);
            throw new Error(
                `Erro ao buscar resumo de horas extras: ${error.message}`
            );
        }

        return data || [];
    } catch (error) {
        console.error("Error in getOvertimeSummary:", error);
        throw error;
    }
}

export async function updateTaskStatus(taskId: string, status: Task["status"]) {
    try {
        const supabase = await createClient();
        console.log("Updating task status:", { taskId, status });

        const { data, error } = await supabase
            .from("tasks")
            .update({ status })
            .eq("id", taskId)
            .select()
            .single();

        if (error) {
            console.error("Error updating status:", error);
            throw new Error(`Erro ao atualizar status: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error in updateTaskStatus function:", error);
        throw error;
    }
}

export async function startTimeTracking(taskId: string) {
    try {
        const supabase = await createClient();
        console.log("Starting time tracking for task:", taskId);

        await stopTimeTracking(taskId);

        const { data, error } = await supabase
            .from("time_entries")
            .insert([
                {
                    task_id: taskId,
                    start_time: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Error starting time tracking:", error);
            throw new Error(`Erro ao iniciar rastreamento: ${error.message}`);
        }

        await updateTaskStatus(taskId, "in_progress");

        return data;
    } catch (error) {
        console.error("Error in startTimeTracking function:", error);
        throw error;
    }
}

export async function deleteTask(taskId: string) {
    try {
        const supabase = await createClient();
        console.log("Deleting task:", taskId);

        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
            throw new Error(`Erro ao excluir tarefa: ${error.message}`);
        }

        console.log("Task deleted successfully");
    } catch (error) {
        console.error("Error in deleteTask function:", error);
        throw error;
    }
}
