// news/hooks/useNews.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { newsApi, ConflictResponse, ConflictAction } from "../services/newsApi";
import { Employee, EmployeeNews, NewsFormData } from "../types";

export function useNews() {
const [employees, setEmployees] = useState<Employee[]>([]);
const [newsList,  setNewsList]  = useState<EmployeeNews[]>([]);
const [loading,   setLoading]   = useState(true);

// Estado del conflicto
const [conflict,        setConflict]        = useState<ConflictResponse | null>(null);
const [pendingFormData, setPendingFormData] = useState<NewsFormData | null>(null);

useEffect(() => {
    async function fetchAll() {
    try {
        const [empData, newsData] = await Promise.all([
        newsApi.getEmployees(),
        newsApi.getAll(),
        ]);
        setEmployees(empData);
        setNewsList(newsData);
    } catch {
        toast.error("Error al conectar con el servidor");
    } finally {
        setLoading(false);
    }
    }
    fetchAll();
}, []);

const reload = async () => {
    const data = await newsApi.getAll();
    setNewsList(data);
};

const createOrUpdate = async (formData: NewsFormData, editingId?: number): Promise<boolean> => {
    if (!formData.employeeId || !formData.date || !formData.description) {
    toast.error("Empleado, fecha y descripción son obligatorios");
    return false;
    }
    try {
    if (editingId) {
        await newsApi.update(editingId, formData);
        toast.success("Novedad actualizada");
        await reload();
        return true;
    }

    // Primera llamada — sin acción, detecta conflictos
    const result = await newsApi.create(formData);

    if ("conflict" in result) {
        setPendingFormData(formData);
        setConflict(result);
        return false; // mantiene el form abierto
    }

    toast.success("Novedad creada");
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    return false;
    }
};

// El usuario tomó una decisión desde el modal
const resolveConflict = async (conflictAction: ConflictAction): Promise<boolean> => {
    if (!pendingFormData) return false;
    try {
    const result = await newsApi.create(pendingFormData, conflictAction);

    if ("conflict" in result) {
        // No debería pasar, pero por seguridad
        toast.error("Error inesperado al resolver conflicto");
        return false;
    }

    const messages: Record<string, string> = {
        cancel:   "Novedad creada y citas canceladas",
        keep:     "Novedad creada — servicios sin cambios",
        reassign: "Novedad creada y servicios reasignados",
    };
    toast.success(messages[conflictAction.action] ?? "Novedad creada");

    setConflict(null);
    setPendingFormData(null);
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    return false;
    }
};

const dismissConflict = () => {
    setConflict(null);
    setPendingFormData(null);
};

const remove = async (id: number): Promise<boolean> => {
    try {
    await newsApi.remove(id);
    setNewsList(prev => prev.filter(n => n.id !== id));
    toast.success("Novedad eliminada");
    return true;
    } catch {
    toast.error("Error al eliminar");
    return false;
    }
};

const updateStatus = async (id: number, status: EmployeeNews["status"]): Promise<boolean> => {
    try {
    await newsApi.updateStatus(id, status);
    setNewsList(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    toast.success("Estado actualizado");
    return true;
    } catch {
    toast.error("Error al actualizar estado");
    return false;
    }
};

return {
    employees, newsList, loading,
    createOrUpdate, remove, updateStatus,
    conflict, resolveConflict, dismissConflict,
};
}