"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManageAreasDialog } from "./manage-areas-dialog";
import { CreateAreaDialog } from "./create-area-dialog";
import type { Area } from "@/utils/supabase/types";
import { useState, useEffect } from "react";
import { Badge } from "@/components/index";
import { getAreas } from "@/utils/actions";
import { Building2 } from "lucide-react";

interface AreaSelectorProps {
    selectedAreaId: string | null;
    onAreaChange: (areaId: string | null) => void;
    showManagement?: boolean;
}

export function AreaSelector({
    selectedAreaId,
    onAreaChange,
    showManagement = true,
}: AreaSelectorProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAreas = async () => {
        try {
            setIsLoading(true);
            const data = await getAreas();
            setAreas(data);
        } catch (error) {
            console.error("Erro ao carregar áreas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAreas();
    }, []);

    const selectedArea = areas.find((area) => area.id === selectedAreaId);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                    Área:
                </span>
            </div>

            <Select
                value={selectedAreaId || "all"}
                onValueChange={(value) =>
                    onAreaChange(value === "all" ? null : value)
                }
                disabled={isLoading}
            >
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione uma área">
                        {selectedArea ? (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: selectedArea.color,
                                    }}
                                />
                                {selectedArea.name}
                            </div>
                        ) : (
                            "Todas as Áreas"
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400" />
                            Todas as Áreas
                        </div>
                    </SelectItem>
                    {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: area.color }}
                                />
                                {area.name}
                                {area.is_default && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        Padrão
                                    </Badge>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {showManagement && (
                <div className="flex items-center gap-1">
                    <CreateAreaDialog onAreaCreated={loadAreas} />
                    <ManageAreasDialog
                        areas={areas}
                        onAreasUpdated={loadAreas}
                    />
                </div>
            )}

            {selectedArea && (
                <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                        borderColor: selectedArea.color,
                        color: selectedArea.color,
                    }}
                >
                    {areas.filter((a) => a.id === selectedAreaId).length > 0
                        ? "Filtrado"
                        : "Todas"}
                </Badge>
            )}
        </div>
    );
}
