import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gerenciamento de Horas",
    description: "Gerencie as horas trabalhas em seus projetos",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-br" className="scroll-smooth">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
