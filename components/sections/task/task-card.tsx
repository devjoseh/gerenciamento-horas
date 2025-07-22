"use client";

import { formatTime, formatDateBrasilia, translateStatus, translateStatusToEnglish } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { startTimeTracking, stopTimeTracking, updateTaskStatus, deleteTask } from "@/utils/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Clock, Trash2, Timer, Eye } from "lucide-react";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { TaskSessionsDialog } from "./task-sessions-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { Button, Badge } from "@/components/index";
import { useState } from "react";

interface TaskCardProps {
    task: TaskWithTimeEntries;
    onUpdate: () => void;
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStartStop = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        try {
            const englishStatus = translateStatusToEnglish(newStatus);
            await updateTaskStatus(task.id, englishStatus as any);
            onUpdate();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (
            confirm(
                "Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
            )
        ) {
            setIsLoading(true);
            try {
                await deleteTask(task.id);
                onUpdate();
            } catch (error) {
                console.error("Erro ao excluir tarefa:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 hover:bg-green-200";
            case "in_progress":
                return "bg-blue-100 text-blue-800 hover:bg-blue-200";
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        }
    };

    const translatedStatus = translateStatus(task.status);
    const hasTimeLimit = task.time_limit !== null;
    const hasOvertime = task.total_overtime_seconds > 0;
    const completedSessions = task.time_entries.filter(
        (entry) => entry.duration_seconds
    );
    const maxSessionsToShow = 3; // Show only 3 sessions by default

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                                {task.name}
                            </CardTitle>
                            {hasTimeLimit && (
                                <Badge variant="outline" className="text-xs">
                                    <Timer className="h-3 w-3 mr-1" />
                                    {task.time_limit?.slice(0, 5)}
                                </Badge>
                            )}
                        </div>
                        {task.description && (
                            <CardDescription className="text-sm">
                                {task.description}
                            </CardDescription>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <EditTaskDialog task={task} onTaskUpdated={onUpdate} />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {formatTime(task.total_time_seconds)}
                        </span>
                        {task.is_active && (
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                            >
                                Ativo
                            </Badge>
                        )}
                    </div>
                    <Select
                        value={translatedStatus}
                        onValueChange={handleStatusChange}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Não Iniciada">
                                Não Iniciada
                            </SelectItem>
                            <SelectItem value="Em Andamento">
                                Em Andamento
                            </SelectItem>
                            <SelectItem value="Concluída">Concluída</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Time breakdown */}
                {hasTimeLimit &&
                    (task.total_regular_seconds > 0 ||
                        task.total_overtime_seconds > 0) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                <span className="text-blue-700">
                                    Tempo Regular:
                                </span>
                                <span className="font-medium text-blue-800">
                                    {formatTime(task.total_regular_seconds)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                                <span className="text-orange-700">
                                    Hora Extra:
                                </span>
                                <span className="font-medium text-orange-800">
                                    {formatTime(task.total_overtime_seconds)}
                                </span>
                            </div>
                        </div>
                    )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                            {translatedStatus}
                        </Badge>
                        {hasOvertime && (
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800"
                            >
                                +{formatTime(task.total_overtime_seconds)} extra
                            </Badge>
                        )}
                    </div>
                    <Button
                        onClick={handleStartStop}
                        disabled={isLoading}
                        variant={task.is_active ? "destructive" : "default"}
                        size="sm"
                    >
                        {task.is_active ? (
                            <>
                                <Square className="h-4 w-4 mr-2" />
                                Parar
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar
                            </>
                        )}
                    </Button>
                </div>

                {/* Sessions Display */}
                {completedSessions.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Sessões Recentes
                            </h4>
                            {completedSessions.length > maxSessionsToShow && (
                                <TaskSessionsDialog
                                    task={task}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver todas (
                                            {completedSessions.length})
                                        </Button>
                                    }
                                />
                            )}
                        </div>

                        <div className="space-y-3 max-h-40 overflow-y-auto">
                            {completedSessions
                                .slice(0, maxSessionsToShow)
                                .map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    #
                                                    {completedSessions.length -
                                                        index}
                                                </Badge>
                                                <span className="text-xs text-gray-600">
                                                    �{" "}
                                                    {
                                                        formatDateBrasilia(
                                                            entry.start_time
                                                        ).split(" ")[0]
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {formatTime(
                                                        entry.duration_seconds!
                                                    )}
                                                </span>
                                                {entry.overtime_seconds! >
                                                    0 && (
                                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                        +
                                                        {formatTime(
                                                            entry.overtime_seconds!
                                                        )}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 font-medium">
                                                    ▶️ Início:
                                                </span>
                                                <span className="text-gray-700">
                                                    {formatDateBrasilia(
                                                        entry.start_time
                                                    )}
                                                </span>
                                            </div>
                                            {entry.end_time && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-600 font-medium">
                                                        ⏹️ Fim:
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {formatDateBrasilia(
                                                            entry.end_time
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {entry.overtime_seconds! > 0 && (
                                                <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 rounded">
                                                    <Timer className="h-3 w-3 text-orange-600" />
                                                    <span className="text-orange-700 font-medium">
                                                        Hora extra:{" "}
                                                        {formatTime(
                                                            entry.overtime_seconds!
                                                        )}{" "}
                                                        (após{" "}
                                                        {task.time_limit?.slice(
                                                            0,
                                                            5
                                                        )}
                                                        )
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {completedSessions.length > maxSessionsToShow && (
                            <div className="text-center pt-2">
                                <TaskSessionsDialog
                                    task={task}
                                    trigger={
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs bg-transparent"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver todas as{" "}
                                            {completedSessions.length} sessões
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* No sessions message */}
                {completedSessions.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma sessão registrada</p>
                        <p className="text-xs">
                            Clique em "Iniciar" para começar
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
