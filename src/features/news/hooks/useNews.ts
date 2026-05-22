// news/hooks/useNews.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { newsApi, ConflictResponse, ConflictAction } from "../services/newsApi";
import { Employee, EmployeeNews, NewsFormData } from "../types";

export function useNews() {
const [employees, setEmployees] = useState<Employee[]>([]);
const [newsList,  setNewsList]  = useState<EmployeeNews[]>([]);
const [loading,   setLoading]   = useState(true);
const [loggedEmployeeId, setLoggedEmployeeId] = useState<string | null>(null);

// Protección contra doble clic
const isProcessing = useRef(false);

// Estado del conflicto
const [conflict,        setConflict]        = useState<ConflictResponse | null>(null);
const [pendingFormData, setPendingFormData] = useState<NewsFormData | null>(null);

useEffect(() => {
    async function fetchAll() {
    try {
        // Obtener el usuario logueado y su rol
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        const rol = usuario.rol?.toLowerCase();

        console.log('🔍 Usuario logueado:', usuario);
        console.log('🔍 Rol:', rol);

        let empId: string | null = null;

        // Si es empleado, obtener su ID desde el token
        if (rol === "empleado" || rol === "barbero") {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(
              `${import.meta.env.VITE_API_URL ?? "https://backend-highsoft-sena-production.up.railway.app"}/auth/me`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.ok) {
              const meData = await response.json();
              console.log('🔍 Datos de /auth/me:', meData);
              
              // Buscar el empleado asociado al usuario
              if (meData.perfil?.id) {
                empId = String(meData.perfil.id);
                console.log('✅ Empleado ID encontrado:', empId);
              }
            }
          } catch (err) {
            console.error("❌ Error obteniendo empleado logueado:", err);
          }
        }

        setLoggedEmployeeId(empId);
        console.log('📌 loggedEmployeeId establecido:', empId);

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
    // Prevenir doble clic
    if (isProcessing.current) {
      console.log('⚠️ Novedad en proceso, ignorando clic adicional');
      return false;
    }
    
    // Si es empleado y no tiene employeeId, usar el loggedEmployeeId
    const dataToSend = { ...formData };
    if (loggedEmployeeId && !dataToSend.employeeId) {
      console.log('📝 Usando loggedEmployeeId:', loggedEmployeeId);
      dataToSend.employeeId = loggedEmployeeId;
    }
    
    console.log('📤 Datos a enviar:', dataToSend);
    
    // Validar campos requeridos (después de agregar loggedEmployeeId)
    if (!dataToSend.date || !dataToSend.description) {
      toast.error("Fecha y descripción son obligatorios");
      return false;
    }
    
    if (!dataToSend.employeeId) {
      toast.error("No se pudo identificar el empleado");
      return false;
    }
    
    isProcessing.current = true;
    try {
    if (editingId) {
        await newsApi.update(editingId, dataToSend);
        toast.success("Novedad actualizada");
        await reload();
        return true;
    }

    // Primera llamada — sin acción, detecta conflictos
    const result = await newsApi.create(dataToSend);

    if ("conflict" in result) {
        setPendingFormData(dataToSend);
        setConflict(result);
        return false; // mantiene el form abierto
    }

    toast.success("Novedad creada");
    await reload();
    return true;
    } catch (err: any) {
    toast.error(err.message ?? "Error al guardar");
    return false;
    } finally {
      // Liberar después de 1 segundo
      setTimeout(() => {
        isProcessing.current = false;
      }, 1000);
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
    employees, newsList, loading, loggedEmployeeId,
    createOrUpdate, remove, updateStatus,
    conflict, resolveConflict, dismissConflict,
};
}