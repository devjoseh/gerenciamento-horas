"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translateStatus, translateStatusToEnglish } from "@/lib/utils";
import { Edit, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button, Input, Label, Textarea } from "@/components/index";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { updateTask } from "@/utils/actions/index";
import { useState, useEffect } from "react";
import type React from "react";

interface EditTaskDialogProps {
    task: TaskWithTimeEntries;
    onTaskUpdated: () => void;
    trigger?: React.ReactNode;
}

export function EditTaskDialog({
    task,
    onTaskUpdated,
    trigger,
}: EditTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "",
        timeLimit: "",
    });

    // Initialize form data when dialog opens or task changes
    useEffect(() => {
        if (open && task) {
            setFormData({
                name: task.name || "",
                description: task.description || "",
                status: translateStatus(task.status),
                timeLimit: task.time_limit ? task.time_limit.slice(0, 5) : "", // Convert "HH:MM:SS" to "HH:MM"
            });
            setError(null);
            setSuccess(null);
        }
    }, [open, task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError("Nome da tarefa é obrigatório");
            return;
        }

        // Validate time format if provided
        if (
            formData.timeLimit &&
            !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.timeLimit)
        ) {
            setError("Formato de horário inválido. Use HH:MM (ex: 18:00)");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            console.log("Tentando atualizar tarefa:", formData);

            const updates = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: translateStatusToEnglish(formData.status) as any,
                time_limit: formData.timeLimit
                    ? `${formData.timeLimit}:00`
                    : null,
            };

            const result = await updateTask(task.id, updates);
            console.log("Tarefa atualizada com sucesso:", result);

            setSuccess("Tarefa atualizada com sucesso!");

            // Close dialog after a short delay to show success message
            setTimeout(() => {
                setOpen(false);
                onTaskUpdated();
            }, 1500);
        } catch (error) {
            console.error("Erro detalhado ao atualizar tarefa:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro desconhecido ao atualizar tarefa"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setError(null);
            setSuccess(null);
        }
    };

    const defaultTrigger = (
        <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
            <Edit className="h-4 w-4" />
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Tarefa</DialogTitle>
                        <DialogDescription>
                            Modifique os detalhes da tarefa. Todas as alterações
                            serão salvas imediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome da Tarefa *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Digite o nome da tarefa..."
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Digite a descrição da tarefa..."
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: value,
                                    }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Não Iniciada">
                                        Não Iniciada
                                    </SelectItem>
                                    <SelectItem value="Em Andamento">
                                        Em Andamento
                                    </SelectItem>
                                    <SelectItem value="Concluída">
                                        Concluída
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="edit-timeLimit"
                                className="flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                Horário Limite
                            </Label>
                            <Input
                                id="edit-timeLimit"
                                type="time"
                                value={formData.timeLimit}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        timeLimit: e.target.value,
                                    }))
                                }
                                disabled={isLoading}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tempo trabalhado após este horário será
                                contabilizado como hora extra
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                        >
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
