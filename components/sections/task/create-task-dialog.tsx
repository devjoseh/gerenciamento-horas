"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, Input, Label, Textarea } from "@/components/index";
import { Plus, AlertCircle, Clock, Building2 } from "lucide-react";
import { createTask, getAreas } from "@/utils/actions/index";
import type { Area } from "@/utils/supabase/types";
import { useState, useEffect } from "react";
import type React from "react";

interface CreateTaskDialogProps {
    onTaskCreated: () => void;
    selectedAreaId?: string | null;
}

export function CreateTaskDialog({
    onTaskCreated,
    selectedAreaId,
}: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        timeLimit: "",
        areaId: "",
    });

    const loadAreas = async () => {
        try {
            const data = await getAreas();
            setAreas(data);

            // Set default area if one is selected or find the default area
            if (selectedAreaId) {
                setFormData((prev) => ({ ...prev, areaId: selectedAreaId }));
            } else {
                const defaultArea = data.find((area) => area.is_default);
                if (defaultArea) {
                    setFormData((prev) => ({
                        ...prev,
                        areaId: defaultArea.id,
                    }));
                }
            }
        } catch (error) {
            console.error("Erro ao carregar áreas:", error);
        }
    };

    useEffect(() => {
        if (open) {
            loadAreas();
        }
    }, [open, selectedAreaId]);

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

        try {
            console.log("Tentando criar tarefa:", formData);
            const timeLimit = formData.timeLimit
                ? `${formData.timeLimit}:00`
                : undefined;
            const result = await createTask(
                formData.name.trim(),
                formData.description.trim(),
                timeLimit,
                formData.areaId || undefined
            );
            console.log("Tarefa criada com sucesso:", result);

            setFormData({
                name: "",
                description: "",
                timeLimit: "",
                areaId: selectedAreaId || "",
            });
            setOpen(false);
            onTaskCreated();
        } catch (error) {
            console.error("Erro detalhado ao criar tarefa:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro desconhecido ao criar tarefa"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setError(null);
            setFormData({
                name: "",
                description: "",
                timeLimit: "",
                areaId: selectedAreaId || "",
            });
        }
    };

    const selectedArea = areas.find((area) => area.id === formData.areaId);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Tarefa</DialogTitle>
                        <DialogDescription>
                            Adicione uma nova tarefa para começar a rastrear seu
                            tempo. Defina um horário limite para calcular horas
                            extras automaticamente.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Tarefa *</Label>
                            <Input
                                id="name"
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
                            <Label htmlFor="description">
                                Descrição (Opcional)
                            </Label>
                            <Textarea
                                id="description"
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
                            <Label
                                htmlFor="areaId"
                                className="flex items-center gap-2"
                            >
                                <Building2 className="h-4 w-4" />
                                Área
                            </Label>
                            <Select
                                value={formData.areaId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        areaId: value,
                                    }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma área">
                                        {selectedArea && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            selectedArea.color,
                                                    }}
                                                />
                                                {selectedArea.name}
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {areas.map((area) => (
                                        <SelectItem
                                            key={area.id}
                                            value={area.id}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            area.color,
                                                    }}
                                                />
                                                {area.name}
                                                {area.is_default && (
                                                    <span className="text-xs text-muted-foreground">
                                                        (Padrão)
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="timeLimit"
                                className="flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                Horário Limite (Opcional)
                            </Label>
                            <Input
                                id="timeLimit"
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
                            {isLoading ? "Criando..." : "Criar Tarefa"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
