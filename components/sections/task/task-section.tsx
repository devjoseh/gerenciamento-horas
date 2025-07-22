"use client";

import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { formatTime } from "@/lib/utils";
import { TaskCard } from "./task-card";

interface TaskSectionProps {
    title: string;
    tasks: TaskWithTimeEntries[];
    onUpdate: () => void;
    emptyMessage: string;
    color: string;
}

export function TaskSection({
    title,
    tasks,
    onUpdate,
    emptyMessage,
    color,
}: TaskSectionProps) {
    const totalTime = tasks.reduce(
        (sum, task) => sum + task.total_time_seconds,
        0
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        {tasks.length}{" "}
                        {tasks.length === 1 ? "tarefa" : "tarefas"}
                    </span>
                    {totalTime > 0 && (
                        <span
                            className={`text-sm font-medium px-2 py-1 rounded-full ${color}`}
                        >
                            {formatTime(totalTime)}
                        </span>
                    )}
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
