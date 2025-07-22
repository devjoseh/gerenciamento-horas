"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TaskFiltersProps {
    statusFilter: string;
    searchQuery: string;
    onStatusFilterChange: (value: string) => void;
    onSearchQueryChange: (value: string) => void;
}

export function TaskFilters({
    statusFilter,
    searchQuery,
    onStatusFilterChange,
    onSearchQueryChange,
}: TaskFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Buscar tarefas..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Tarefas</SelectItem>
                    <SelectItem value="pending">Não Iniciadas</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
