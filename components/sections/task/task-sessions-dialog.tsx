"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatTime, formatDateBrasilia, formatDateOnlyBrasilia } from "@/lib/utils";
import type { TaskWithTimeEntries } from "@/utils/supabase/types";
import { Button, Badge, ScrollArea } from "@/components/index";
import { Clock, Calendar, Play, Timer } from "lucide-react";
import { useState } from "react";
import type React from "react";

interface TaskSessionsDialogProps {
    task: TaskWithTimeEntries;
    trigger?: React.ReactNode;
}

export function TaskSessionsDialog({ task, trigger }: TaskSessionsDialogProps) {
    const [open, setOpen] = useState(false);

    const completedSessions = task.time_entries.filter(
        (entry) => entry.duration_seconds
    );
    const activeSessions = task.time_entries.filter((entry) => !entry.end_time);

    const defaultTrigger = (
        <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs"
        >
            Ver todas as sessões ({completedSessions.length})
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Todas as Sessões - {task.name}
                    </DialogTitle>
                    <DialogDescription>
                        Histórico completo de sessões de trabalho para esta
                        tarefa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Task Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-gray-600">
                                    Total de Sessões
                                </p>
                                <p className="text-lg font-bold">
                                    {completedSessions.length}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">
                                    Tempo Total
                                </p>
                                <p className="text-lg font-bold">
                                    {formatTime(task.total_time_seconds)}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">
                                    Tempo Regular
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {formatTime(task.total_regular_seconds)}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-600">
                                    Horas Extras
                                </p>
                                <p className="text-lg font-bold text-orange-600">
                                    {formatTime(task.total_overtime_seconds)}
                                </p>
                            </div>
                        </div>

                        {task.time_limit && (
                            <div className="mt-3 flex items-center gap-2">
                                <Timer className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                    Horário limite configurado:{" "}
                                    <strong>
                                        {task.time_limit.slice(0, 5)}
                                    </strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Active Sessions */}
                    {activeSessions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-medium text-green-700 flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                Sessão Ativa
                            </h3>
                            {activeSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 border-2 border-green-200 bg-green-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className="bg-green-100 text-green-800">
                                            Em Andamento
                                        </Badge>
                                        <span className="text-sm text-green-600 font-medium">
                                            Iniciada em{" "}
                                            {formatDateOnlyBrasilia(
                                                session.start_time
                                            )}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-medium">
                                                ▶️ Início:
                                            </span>
                                            <span>
                                                {formatDateBrasilia(
                                                    session.start_time
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600">
                                                ⏱️ Tempo decorrido:
                                            </span>
                                            <span className="font-medium">
                                                {formatTime(
                                                    Math.floor(
                                                        (Date.now() -
                                                            new Date(
                                                                session.start_time
                                                            ).getTime()) /
                                                            1000
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Completed Sessions */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Sessões Concluídas ({completedSessions.length})
                        </h3>

                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {completedSessions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Nenhuma sessão concluída ainda</p>
                                        <p className="text-sm">
                                            Inicie o timer para começar a
                                            registrar tempo
                                        </p>
                                    </div>
                                ) : (
                                    completedSessions.map((session, index) => (
                                        <div
                                            key={session.id}
                                            className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Sessão #
                                                        {completedSessions.length -
                                                            index}
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDateOnlyBrasilia(
                                                            session.start_time
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {formatTime(
                                                            session.duration_seconds!
                                                        )}
                                                    </span>
                                                    {session.overtime_seconds! >
                                                        0 && (
                                                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                            +
                                                            {formatTime(
                                                                session.overtime_seconds!
                                                            )}{" "}
                                                            extra
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600 font-medium">
                                                            ▶️ Início:
                                                        </span>
                                                        <span>
                                                            {formatDateBrasilia(
                                                                session.start_time
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-red-600 font-medium">
                                                            ⏹️ Fim:
                                                        </span>
                                                        <span>
                                                            {session.end_time
                                                                ? formatDateBrasilia(
                                                                      session.end_time
                                                                  )
                                                                : "Em andamento"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-600 font-medium">
                                                            ⏱️ Duração:
                                                        </span>
                                                        <span className="font-medium">
                                                            {formatTime(
                                                                session.duration_seconds!
                                                            )}
                                                        </span>
                                                    </div>
                                                    {task.time_limit && (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-blue-600">
                                                                    � Regular:
                                                                </span>
                                                                <span>
                                                                    {formatTime(
                                                                        session.regular_seconds ||
                                                                            0
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-orange-600">
                                                                    ⏰ Extra:
                                                                </span>
                                                                <span>
                                                                    {formatTime(
                                                                        session.overtime_seconds ||
                                                                            0
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Overtime Details */}
                                            {session.overtime_seconds! > 0 &&
                                                task.time_limit && (
                                                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Timer className="h-4 w-4 text-orange-600" />
                                                            <span className="text-sm font-medium text-orange-800">
                                                                Detalhes da Hora
                                                                Extra
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-orange-700 space-y-1">
                                                            <p>
                                                                <strong>
                                                                    Limite:
                                                                </strong>{" "}
                                                                {task.time_limit.slice(
                                                                    0,
                                                                    5
                                                                )}{" "}
                                                                •{" "}
                                                                <strong>
                                                                    Hora extra
                                                                    iniciou:
                                                                </strong>{" "}
                                                                {task.time_limit.slice(
                                                                    0,
                                                                    5
                                                                )}{" "}
                                                                •{" "}
                                                                <strong>
                                                                    Duração
                                                                    extra:
                                                                </strong>{" "}
                                                                {formatTime(
                                                                    session.overtime_seconds!
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
