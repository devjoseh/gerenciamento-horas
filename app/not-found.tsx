"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <Card className="shadow-lg">
                    <CardContent className="p-12">
                        {/* 404 Visual */}
                        <div className="mb-8">
                            <div className="relative inline-block">
                                <div className="text-8xl font-bold text-gray-200 select-none">
                                    404
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Clock className="h-16 w-16 text-blue-500 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="mb-8 space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Oops! Página não encontrada
                            </h1>
                            <p className="text-lg text-gray-600 max-w-md mx-auto">
                                Parece que você se perdeu no tempo! A página que
                                você está procurando não existe ou foi movida.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/">
                                    <Home className="h-5 w-5" />
                                    Ir para Início
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2 bg-transparent"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Voltar
                            </Button>
                        </div>

                        {/* Fun Element */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 italic">
                                &quot; O tempo perdido nunca se recupera, mas você
                                pode recuperar o caminho! &quot;⏰
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Help */}
                <div className="mt-6 text-sm text-gray-500">
                    <p>
                        Precisa de ajuda? Entre em contato conosco ou{" "}
                        <Link
                            href="/"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            volte ao controle de tempo
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
