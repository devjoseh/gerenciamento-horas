"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const SignInSchema = z.object({
    email: z.string().trim().min(1, "Email é obrigatório").email("Email inválido"),
    password: z.string().min(1, "Senha é obrigatória"),
});

const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: "Email ou senha incorretos",
    CAPTCHA_FAILED: "Falha na verificação. Tente novamente.",
    VALIDATION_FAILED: "Dados inválidos fornecidos",
} as const;

export async function signIn(formData: FormData) {
    try {
        const validation = SignInSchema.safeParse({
            email: formData.get("email"),
            password: formData.get("password"),
        });

        if (!validation.success) {
            const errorMessages = validation.error.issues.map((issue) => issue.message);
            return { success: false, message: errorMessages.join("; ") };
        }

        const { email, password } = validation.data;
        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            const message = error.message === "Invalid login credentials"
                ? ERROR_MESSAGES.INVALID_CREDENTIALS
                : error.message;

            return { success: false, message };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected sign in error:', error);
        return { 
            success: false, 
            message: "Erro interno do servidor. Tente novamente." 
        };
    }
}