"use server";

import { createClient } from "../supabase/server";
import { Area } from "../supabase/types";

export async function getAreas(): Promise<Area[]> {
    try {
        const supabase = await createClient();
        console.log("Fetching areas...");

        const { data: areas, error } = await supabase
            .from("areas")
            .select("*")
            .order("is_default", { ascending: false })
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching areas:", error);
            throw new Error(`Erro ao buscar áreas: ${error.message}`);
        }

        console.log("Areas found:", areas?.length || 0);
        return areas || [];
    } catch (error) {
        console.error("Error in getAreas:", error);
        throw error;
    }
}

export async function createArea(
    name: string,
    description: string,
    color = "#4472C4"
) {
    try {
        const supabase = await createClient();
        console.log("Creating area with data:", { name, description, color });

        if (!name || name.trim().length === 0) {
            throw new Error("Nome da área é obrigatório");
        }

        const areaData = {
            name: name.trim(),
            description: description.trim() || null,
            color: color,
            is_default: false,
        };

        console.log("Area data to insert:", areaData);

        const { data, error } = await supabase
            .from("areas")
            .insert([areaData])
            .select()
            .single();

        if (error) {
            console.error("Supabase error creating area:", error);
            throw new Error(`Erro ao criar área: ${error.message}`);
        }

        if (!data) {
            throw new Error("Nenhum dado retornado após criar a área");
        }

        console.log("Area created successfully:", data);
        return data;
    } catch (error) {
        console.error("Error in createArea function:", error);
        throw error;
    }
}

export async function updateArea(
    areaId: string,
    updates: {
        name?: string;
        description?: string;
        color?: string;
    }
) {
    try {
        const supabase = await createClient();
        console.log("Updating area with data:", { areaId, updates });

        if (
            updates.name !== undefined &&
            (!updates.name || updates.name.trim().length === 0)
        ) {
            throw new Error("Nome da área é obrigatório");
        }

        // Prepare update data, only including defined fields
        const updateData: any = {};

        if (updates.name !== undefined) {
            updateData.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            updateData.description = updates.description.trim() || null;
        }

        if (updates.color !== undefined) {
            updateData.color = updates.color;
        }

        console.log("Prepared update data:", updateData);

        const { data, error } = await supabase
            .from("areas")
            .update(updateData)
            .eq("id", areaId)
            .select()
            .single();

        if (error) {
            console.error("Supabase error updating area:", error);
            throw new Error(`Erro ao atualizar área: ${error.message}`);
        }

        if (!data) {
            throw new Error("Nenhum dado retornado após atualizar a área");
        }

        console.log("Area updated successfully:", data);
        return data;
    } catch (error) {
        console.error("Error in updateArea function:", error);
        throw error;
    }
}

export async function deleteArea(areaId: string) {
    try {
        const supabase = await createClient();
        console.log("Deleting area:", areaId);

        // Check if area has tasks
        const { data: tasks } = await supabase
            .from("tasks")
            .select("id")
            .eq("area_id", areaId)
            .limit(1);

        if (tasks && tasks.length > 0) {
            throw new Error(
                "Não é possível excluir uma área que possui tarefas. Mova as tarefas para outra área primeiro."
            );
        }

        const { error } = await supabase
            .from("areas")
            .delete()
            .eq("id", areaId);

        if (error) {
            console.error("Error deleting area:", error);
            throw new Error(`Erro ao excluir área: ${error.message}`);
        }

        console.log("Area deleted successfully");
    } catch (error) {
        console.error("Error in deleteArea function:", error);
        throw error;
    }
}
