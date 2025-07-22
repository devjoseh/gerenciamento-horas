"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OvertimeSummary } from "@/utils/supabase/types";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import { getOvertimeSummary } from "@/utils/actions";
import { useState, useEffect } from "react";
import { Badge } from "@/components/index";
import { formatTime } from "@/lib/utils";

export function OvertimeSummaryCard() {
    const [overtimeSummary, setOvertimeSummary] = useState<OvertimeSummary[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);

    const loadOvertimeSummary = async () => {
        try {
            setIsLoading(true);
            const data = await getOvertimeSummary();
            setOvertimeSummary(data);
        } catch (error) {
            console.error("Erro ao carregar resumo de horas extras:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOvertimeSummary();
    }, []);

    const totalOvertime = overtimeSummary.reduce(
        (sum, day) => sum + day.total_overtime_seconds,
        0
    );
    const thisWeekOvertime = overtimeSummary
        .filter((day) => {
            const dayDate = new Date(day.date);
            const today = new Date();
            const weekStart = new Date(
                today.setDate(today.getDate() - today.getDay())
            );
            return dayDate >= weekStart;
        })
        .reduce((sum, day) => sum + day.total_overtime_seconds, 0);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Resumo de Horas Extras
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo de Horas Extras
                </CardTitle>
                <CardDescription>
                    Controle suas horas extras para cobrança
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-800">
                            {formatTime(thisWeekOvertime)}
                        </div>
                        <div className="text-sm text-orange-600">
                            Esta Semana
                        </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-800">
                            {formatTime(totalOvertime)}
                        </div>
                        <div className="text-sm text-purple-600">
                            Total (30 dias)
                        </div>
                    </div>
                </div>

                {overtimeSummary.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Últimos Dias com Hora Extra
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {overtimeSummary
                                .filter((day) => day.total_overtime_seconds > 0)
                                .slice(0, 5)
                                .map((day) => (
                                    <div
                                        key={day.id}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span className="text-muted-foreground">
                                            {new Date(
                                                day.date
                                            ).toLocaleDateString("pt-BR")}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-orange-100 text-orange-800"
                                        >
                                            +
                                            {formatTime(
                                                day.total_overtime_seconds
                                            )}
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {totalOvertime === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            Nenhuma hora extra registrada ainda
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
