"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, Input, Label, Textarea } from "@/components/index";
import { Plus, AlertCircle, Palette } from "lucide-react";
import { createArea } from "@/utils/actions";
import { useState } from "react";
import type React from "react";

interface CreateAreaDialogProps {
    onAreaCreated: () => void;
}

const predefinedColors = [
    "#4472C4",
    "#70AD47",
    "#FF9900",
    "#C5504B",
    "#9966CC",
    "#36A2EB",
    "#FF6384",
    "#4BC0C0",
    "#FF9F40",
    "#9966FF",
];

export function CreateAreaDialog({ onAreaCreated }: CreateAreaDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#4472C4",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError("Nome da área é obrigatório");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log("Tentando criar área:", formData);
            const result = await createArea(
                formData.name.trim(),
                formData.description.trim(),
                formData.color
            );
            console.log("Área criada com sucesso:", result);

            setFormData({ name: "", description: "", color: "#4472C4" });
            setOpen(false);
            onAreaCreated();
        } catch (error) {
            console.error("Erro detalhado ao criar área:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro desconhecido ao criar área"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setError(null);
            setFormData({ name: "", description: "", color: "#4472C4" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Área</DialogTitle>
                        <DialogDescription>
                            Crie uma nova área para organizar suas tarefas por
                            empresa, projeto ou categoria.
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
                            <Label htmlFor="name">Nome da Área *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Ex: Empresa XYZ, Projetos Pessoais..."
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
                                placeholder="Descreva o propósito desta área..."
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Cor de Identificação
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            color: e.target.value,
                                        }))
                                    }
                                    disabled={isLoading}
                                    className="w-16 h-10 p-1 border rounded"
                                />
                                <div className="flex flex-wrap gap-1">
                                    {predefinedColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                                            style={{ backgroundColor: color }}
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    color,
                                                }))
                                            }
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                A cor será usada para identificar visualmente
                                esta área
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
                            {isLoading ? "Criando..." : "Criar Área"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
