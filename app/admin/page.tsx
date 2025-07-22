"use client";

import { CreateTaskDialog, TaskFilters, TaskSection, TaskListView, OvertimeSummaryCard, ReportsDashboard, AreaSelector } from "@/components/index";
import { Clock, TrendingUp, CheckCircle, Play, Grid, List, FileSpreadsheet } from "lucide-react";
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/index";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { useState, useEffect } from "react";
import { getTasks } from "@/utils/actions";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
    const [tasks, setTasks] = useState<TaskWithTimeEntries[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskWithTimeEntries[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("tasks");

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const data = await getTasks(selectedAreaId || undefined);
            setTasks(data);
            console.log(data)
        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [selectedAreaId]);

    useEffect(() => {
        let filtered = tasks;

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((task) => task.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.name.toLowerCase().includes(query) ||
                    (task.description &&
                        task.description.toLowerCase().includes(query)) ||
                    (task.area && task.area.name.toLowerCase().includes(query))
            );
        }

        setFilteredTasks(filtered);
    }, [tasks, statusFilter, searchQuery]);

    // Separate tasks by status
    const pendingTasks = filteredTasks.filter(
        (task) => task.status === "pending"
    );
    const inProgressTasks = filteredTasks.filter(
        (task) => task.status === "in_progress"
    );
    const completedTasks = filteredTasks.filter(
        (task) => task.status === "completed"
    );

    const totalTime = tasks.reduce(
        (sum, task) => sum + task.total_time_seconds,
        0
    );
    const totalOvertime = tasks.reduce(
        (sum, task) => sum + task.total_overtime_seconds,
        0
    );
    const activeTasks = tasks.filter((task) => task.is_active).length;
    const completedTasksCount = tasks.filter(
        (task) => task.status === "completed"
    ).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando suas tarefas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Controle de Tempo
                    </h1>
                </div>

                {/* Area Selector */}
                <div className="mb-6">
                    <AreaSelector
                        selectedAreaId={selectedAreaId}
                        onAreaChange={setSelectedAreaId}
                    />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Tempo Total
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatTime(totalTime)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <Play className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Tarefas Ativas
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {activeTasks}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Horas Extras
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatTime(totalOvertime)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">
                                    Concluídas
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {completedTasksCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="tasks"
                            className="flex items-center gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Tarefas
                        </TabsTrigger>
                        <TabsTrigger
                            value="overtime"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="h-4 w-4" />
                            Horas Extras
                        </TabsTrigger>
                        <TabsTrigger
                            value="reports"
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Relatórios
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-6">
                        {/* Actions and Filters */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CreateTaskDialog
                                onTaskCreated={loadTasks}
                                selectedAreaId={selectedAreaId}
                            />

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {filteredTasks.length}{" "}
                                    {filteredTasks.length === 1
                                        ? "tarefa"
                                        : "tarefas"}
                                </Badge>
                                <div className="flex items-center border rounded-md">
                                    <Button
                                        variant={
                                            viewMode === "grid"
                                                ? "default"
                                                : "ghost"
                                        }
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className="rounded-r-none"
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={
                                            viewMode === "list"
                                                ? "default"
                                                : "ghost"
                                        }
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="rounded-l-none"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <TaskFilters
                            statusFilter={statusFilter}
                            searchQuery={searchQuery}
                            onStatusFilterChange={setStatusFilter}
                            onSearchQueryChange={setSearchQuery}
                        />

                        {/* Task Sections */}
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                                    <Clock className="h-full w-full" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {tasks.length === 0
                                        ? "Nenhuma tarefa ainda"
                                        : "Nenhuma tarefa corresponde aos filtros"}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {tasks.length === 0
                                        ? "Crie sua primeira tarefa para começar a rastrear o tempo"
                                        : "Tente ajustar sua busca ou critérios de filtro"}
                                </p>
                                {tasks.length === 0 && (
                                    <CreateTaskDialog
                                        onTaskCreated={loadTasks}
                                        selectedAreaId={selectedAreaId}
                                    />
                                )}
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="space-y-8">
                                <TaskSection
                                    title="🔴 Não Iniciadas"
                                    tasks={pendingTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa não iniciada"
                                    color="bg-gray-100 text-gray-800"
                                />

                                <TaskSection
                                    title="🟡 Em Andamento"
                                    tasks={inProgressTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa em andamento"
                                    color="bg-blue-100 text-blue-800"
                                />

                                <TaskSection
                                    title="🟢 Concluídas"
                                    tasks={completedTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa concluída"
                                    color="bg-green-100 text-green-800"
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <TaskListView
                                    title="🔴 Não Iniciadas"
                                    tasks={pendingTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa não iniciada"
                                />

                                <TaskListView
                                    title="🟡 Em Andamento"
                                    tasks={inProgressTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa em andamento"
                                />

                                <TaskListView
                                    title="🟢 Concluídas"
                                    tasks={completedTasks}
                                    onUpdate={loadTasks}
                                    emptyMessage="Nenhuma tarefa concluída"
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="overtime">
                        <OvertimeSummaryCard />
                    </TabsContent>

                    <TabsContent value="reports">
                        <ReportsDashboard selectedAreaId={selectedAreaId} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
