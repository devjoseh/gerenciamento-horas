"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startTimeTracking, stopTimeTracking } from "@/utils/actions";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { Clock, Timer, Play, Square } from "lucide-react";
import { formatTime, translateStatus } from "@/lib/utils";
import { TaskActionsMenu } from "./task-actions-menu";
import { EditTaskDialog } from "./edit-task-dialog";
import { Badge, Button } from "@/components/index";
import { useState } from "react";

interface TaskListViewProps {
    tasks: TaskWithTimeEntries[];
    onUpdate: () => void;
    title: string;
    emptyMessage: string;
}

export function TaskListView({
    tasks,
    onUpdate,
    title,
    emptyMessage,
}: TaskListViewProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleQuickStartStop = async (task: TaskWithTimeEntries) => {
        setIsLoading(task.id);
        try {
            if (task.is_active) {
                await stopTimeTracking(task.id);
            } else {
                await startTimeTracking(task.id);
            }
            onUpdate();
        } catch (error) {
            console.error("Erro ao alternar rastreamento de tempo:", error);
        } finally {
            setIsLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (tasks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <p>{emptyMessage}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {title}
                    <Badge variant="secondary">{tasks.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                    {task.name}
                                </h4>
                                {task.time_limit && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        <Timer className="h-3 w-3 mr-1" />
                                        {task.time_limit.slice(0, 5)}
                                    </Badge>
                                )}
                                <Badge
                                    className={getStatusColor(task.status)}
                                    variant="secondary"
                                >
                                    {translateStatus(task.status)}
                                </Badge>
                                {task.is_active && (
                                    <Badge className="bg-green-100 text-green-800">
                                        Ativo
                                    </Badge>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-xs text-gray-600 truncate mb-2">
                                    {task.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(task.total_time_seconds)}
                                </div>
                                {task.total_overtime_seconds > 0 && (
                                    <div className="text-orange-600 font-medium">
                                        +
                                        {formatTime(
                                            task.total_overtime_seconds
                                        )}{" "}
                                        extra
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStartStop(task)}
                                disabled={isLoading === task.id}
                                className={
                                    task.is_active
                                        ? "text-red-600 hover:text-red-700"
                                        : "text-green-600 hover:text-green-700"
                                }
                            >
                                {task.is_active ? (
                                    <Square className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>

                            <EditTaskDialog
                                task={task}
                                onTaskUpdated={onUpdate}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        Editar
                                    </Button>
                                }
                            />

                            <TaskActionsMenu task={task} onUpdate={onUpdate} />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
