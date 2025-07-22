"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { startTimeTracking, stopTimeTracking, updateTaskStatus, deleteTask } from "@/utils/actions/index";
import { MoreVertical, Edit, Trash2, Play, Square, CheckCircle } from "lucide-react";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { EditTaskDialog } from "./edit-task-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TaskActionsMenuProps {
    task: TaskWithTimeEntries;
    onUpdate: () => void;
}

export function TaskActionsMenu({ task, onUpdate }: TaskActionsMenuProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

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

    const handleMarkCompleted = async () => {
        setIsLoading(true);
        try {
            await updateTaskStatus(task.id, "completed");
            onUpdate();
        } catch (error) {
            console.error("Erro ao marcar como concluída:", error);
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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Tarefa
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleStartStop}>
                        {task.is_active ? (
                            <>
                                <Square className="h-4 w-4 mr-2" />
                                Parar Timer
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Iniciar Timer
                            </>
                        )}
                    </DropdownMenuItem>

                    {task.status !== "completed" && (
                        <DropdownMenuItem onClick={handleMarkCompleted}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Concluída
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Tarefa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditTaskDialog
                task={task}
                onTaskUpdated={onUpdate}
                trigger={<div />} // Hidden trigger since we control it manually
            />
        </>
    );
}
