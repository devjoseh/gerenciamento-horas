"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, Input, Label, Textarea, Badge, ScrollArea, Card, CardContent, Separator } from "@/components/index";
import { Settings, Edit, Trash2, Save, X, Palette, Building2, AlertCircle } from "lucide-react";
import { updateArea, deleteArea } from "@/utils/actions/index";
import type { Area } from "@/utils/supabase/types";
import { useState } from "react";

interface ManageAreasDialogProps {
    areas: Area[];
    onAreasUpdated: () => void;
}

const predefinedColors = [
    { color: "#4472C4", name: "Azul Profissional" },
    { color: "#70AD47", name: "Verde Natureza" },
    { color: "#FF9900", name: "Laranja Energia" },
    { color: "#C5504B", name: "Vermelho Intenso" },
    { color: "#9966CC", name: "Roxo Criativo" },
    { color: "#36A2EB", name: "Azul Céu" },
    { color: "#FF6384", name: "Rosa Moderno" },
    { color: "#4BC0C0", name: "Turquesa" },
    { color: "#FF9F40", name: "Amarelo Dourado" },
    { color: "#8B5CF6", name: "Violeta" },
];

export function ManageAreasDialog({
    areas,
    onAreasUpdated,
}: ManageAreasDialogProps) {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        color: "#4472C4",
    });

    const handleEdit = (area: Area) => {
        setEditingId(area.id);
        setEditForm({
            name: area.name,
            description: area.description || "",
            color: area.color,
        });
        setError(null);
    };

    const handleSave = async (areaId: string) => {
        if (!editForm.name.trim()) {
            setError("Nome da área é obrigatório");
            return;
        }

        setIsLoading(areaId);
        setError(null);

        try {
            await updateArea(areaId, {
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                color: editForm.color,
            });
            setEditingId(null);
            onAreasUpdated();
        } catch (error) {
            console.error("Erro ao atualizar área:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar área"
            );
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = async (areaId: string, areaName: string) => {
        if (
            !confirm(
                `Tem certeza que deseja excluir a área "${areaName}"?\n\nEsta ação não pode ser desfeita.`
            )
        )
            return;

        setIsLoading(areaId);
        setError(null);

        try {
            await deleteArea(areaId);
            onAreasUpdated();
        } catch (error) {
            console.error("Erro ao excluir área:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Erro ao excluir área";
            setError(errorMessage);
        } finally {
            setIsLoading(null);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({ name: "", description: "", color: "#4472C4" });
        setError(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            handleCancel();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Gerenciar áreas"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 gap-0">
                {/* Fixed Header */}
                <div className="flex-shrink-0 p-6 pb-4 border-b bg-white rounded-t-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Gerenciar Áreas
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Organize suas tarefas criando e editando áreas para
                            diferentes projetos ou empresas. Áreas que possuem
                            tarefas não podem ser excluídas.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-6 pt-4">
                            {areas.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Nenhuma área criada
                                        </h3>
                                        <p className="text-gray-600 text-center max-w-md">
                                            Crie sua primeira área para
                                            organizar suas tarefas por projeto,
                                            empresa ou categoria.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {areas.map((area, index) => (
                                        <Card
                                            key={area.id}
                                            className="transition-all duration-200 hover:shadow-md"
                                        >
                                            <CardContent className="p-0">
                                                {editingId === area.id ? (
                                                    /* Edit Mode */
                                                    <div className="p-6 space-y-6">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div
                                                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                                style={{
                                                                    backgroundColor:
                                                                        editForm.color,
                                                                }}
                                                            />
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                Editando Área
                                                            </h3>
                                                        </div>

                                                        <div className="grid gap-4">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`edit-name-${area.id}`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    Nome da Área
                                                                    *
                                                                </Label>
                                                                <Input
                                                                    id={`edit-name-${area.id}`}
                                                                    value={
                                                                        editForm.name
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setEditForm(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                name: e
                                                                                    .target
                                                                                    .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading ===
                                                                        area.id
                                                                    }
                                                                    placeholder="Ex: Empresa XYZ, Projetos Pessoais..."
                                                                    className="text-base"
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`edit-description-${area.id}`}
                                                                    className="text-sm font-medium"
                                                                >
                                                                    Descrição
                                                                    (Opcional)
                                                                </Label>
                                                                <Textarea
                                                                    id={`edit-description-${area.id}`}
                                                                    value={
                                                                        editForm.description
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setEditForm(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                description:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    rows={3}
                                                                    disabled={
                                                                        isLoading ===
                                                                        area.id
                                                                    }
                                                                    placeholder="Descreva o propósito desta área..."
                                                                    className="text-base resize-none"
                                                                />
                                                            </div>

                                                            <div className="space-y-3">
                                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                                    <Palette className="h-4 w-4" />
                                                                    Cor de
                                                                    Identificação
                                                                </Label>

                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <Input
                                                                            type="color"
                                                                            value={
                                                                                editForm.color
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                setEditForm(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        color: e
                                                                                            .target
                                                                                            .value,
                                                                                    })
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isLoading ===
                                                                                area.id
                                                                            }
                                                                            className="w-16 h-10 p-1 border rounded cursor-pointer"
                                                                        />
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        editForm.color,
                                                                                }}
                                                                            />
                                                                            <span className="text-sm text-gray-600 font-mono">
                                                                                {
                                                                                    editForm.color
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-5 gap-2">
                                                                        {predefinedColors.map(
                                                                            ({
                                                                                color,
                                                                                name,
                                                                            }) => (
                                                                                <button
                                                                                    key={
                                                                                        color
                                                                                    }
                                                                                    type="button"
                                                                                    className={`group relative w-full h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                                                                        editForm.color ===
                                                                                        color
                                                                                            ? "border-gray-900 shadow-md"
                                                                                            : "border-gray-300 hover:border-gray-400"
                                                                                    }`}
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            color,
                                                                                    }}
                                                                                    onClick={() =>
                                                                                        setEditForm(
                                                                                            (
                                                                                                prev
                                                                                            ) => ({
                                                                                                ...prev,
                                                                                                color,
                                                                                            })
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        isLoading ===
                                                                                        area.id
                                                                                    }
                                                                                    title={
                                                                                        name
                                                                                    }
                                                                                >
                                                                                    {editForm.color ===
                                                                                        color && (
                                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                                            <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                                                                        </div>
                                                                                    )}
                                                                                </button>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        <div className="flex items-center justify-between pt-2">
                                                            <div className="text-sm text-gray-500">
                                                                * Campos
                                                                obrigatórios
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={
                                                                        handleCancel
                                                                    }
                                                                    disabled={
                                                                        isLoading ===
                                                                        area.id
                                                                    }
                                                                    className="gap-2 bg-transparent"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                    Cancelar
                                                                </Button>
                                                                <Button
                                                                    onClick={() =>
                                                                        handleSave(
                                                                            area.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading ===
                                                                            area.id ||
                                                                        !editForm.name.trim()
                                                                    }
                                                                    className="gap-2 min-w-[100px]"
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                    {isLoading ===
                                                                    area.id
                                                                        ? "Salvando..."
                                                                        : "Salvar"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View Mode */
                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                <div
                                                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                                                    style={{
                                                                        backgroundColor:
                                                                            area.color,
                                                                    }}
                                                                />

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                                            {
                                                                                area.name
                                                                            }
                                                                        </h3>
                                                                        {area.is_default && (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="bg-blue-100 text-blue-800 text-xs"
                                                                            >
                                                                                Área
                                                                                Padrão
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {area.description && (
                                                                        <p className="text-gray-600 text-sm leading-relaxed">
                                                                            {
                                                                                area.description
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                                        <span>
                                                                            Criada
                                                                            em{" "}
                                                                            {new Date(
                                                                                area.created_at
                                                                            ).toLocaleDateString(
                                                                                "pt-BR"
                                                                            )}
                                                                        </span>
                                                                        <span>
                                                                            •
                                                                        </span>
                                                                        <span className="font-mono">
                                                                            {
                                                                                area.color
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 flex-shrink-0 ml-6">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            area
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading ===
                                                                        area.id
                                                                    }
                                                                    className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Editar
                                                                </Button>

                                                                {!area.is_default && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                area.id,
                                                                                area.name
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isLoading ===
                                                                            area.id
                                                                        }
                                                                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Excluir
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Bottom spacing for better scroll experience */}
                            <div className="h-6" />
                        </div>
                    </ScrollArea>
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 p-6 pt-4 border-t bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {areas.length}{" "}
                            {areas.length === 1
                                ? "área criada"
                                : "áreas criadas"}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
