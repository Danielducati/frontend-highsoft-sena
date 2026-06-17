// news/hooks/useNews.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { newsApi, ConflictResponse, ConflictAction, ApprovalConflictResponse } from "../services/newsApi";
import { Employee, EmployeeNews, NewsFormData } from "../types";

export function useNews() {
const [employees, setEmployees] = useState<Employee[]>([]);
const [newsList,  setNewsList]  = useState<EmployeeNews[]>([]);
const [loading,   setLoading]   = useState(true);
const [loggedEmployeeId, setLoggedEmployeeId] = useState<string | null>(null);

// Protección contra doble clic
const isProcessing = useRef(false);

// Estado del conflicto (para creación)
const [conflict,        setConflict]        = useState<ConflictResponse | null>(null);
const [pendingFormData, setPendingFormData] = useState<NewsFormData | null>(null);

// Estado del conflicto (para aprobación)
const [approvalConflict, setApprovalConflict] = useState<ApprovalConflictResponse | null>(null);
const [pendingApproval, setPendingApproval] = useState<{ id: number; status: EmployeeNews["status"] } | null>(null);

useEffect(() => {
    async function fetchAll() {
    try {
        console.log('╔═══════════════════════════════════════════════╗');
        console.log('║      INICIANDO CARGA DE DATOS DE NEWS        ║');
        console.log('╚═══════════════════════════════════════════════╝');
        
        // Obtener el usuario logueado y su rol
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        const rol = usuario.rol?.toLowerCase();

        console.log('[useNews] 👤 Usuario logueado:', JSON.stringify(usuario, null, 2));
        console.log('[useNews] 🎭 Rol:', rol);

        let empId: string | null = null;

        // Si es empleado, obtener su ID desde el token
        if (rol === "empleado" || rol === "barbero") {
          console.log('[useNews] 🔐 Usuario es empleado, obteniendo ID desde /auth/me');
          try {
            const token = localStorage.getItem("token");
            console.log('[useNews] 🎫 Token presente:', !!token);
            
            const apiUrl = import.meta.env.VITE_API_URL ?? "https://backend-highsoft-sena-production.up.railway.app";
            console.log('[useNews] 🌐 Fetching from:', `${apiUrl}/auth/me`);
            
            const response = await fetch(
              `${apiUrl}/auth/me`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('[useNews] 📡 Response status:', response.status);
            
            if (response.ok) {
              const meData = await response.json();
              console.log('[useNews] 📦 /auth/me response:', JSON.stringify(meData, null, 2));
              
              // Buscar el empleado asociado al usuario
              if (meData.perfil?.id) {
                empId = String(meData.perfil.id);
                console.log('[useNews] ✅ Empleado ID encontrado:', empId, '(type:', typeof empId, ')');
              } else {
                console.error('[useNews] ❌ No se encontró perfil.id en respuesta');
                console.error('[useNews] Estructura de meData:', Object.keys(meData));
              }
            } else {
              console.error('[useNews] ❌ Error HTTP al obtener /auth/me:', response.statusText);
            }
          } catch (err) {
            console.error("[useNews] ❌ Error obteniendo empleado logueado:", err);
          }
        } else {
          console.log('[useNews] ℹ️ Usuario NO es empleado (rol:', rol, '), no se obtiene employeeId');
        }

        setLoggedEmployeeId(empId);
        console.log('[useNews] 📌 loggedEmployeeId establecido en state:', empId);
        console.log('─────────────────────────────────────────────────');

        const [empData, newsData] = await Promise.all([
        newsApi.getEmployees(),
        newsApi.getAll(),
        ]);
        
        console.log('[useNews] 👥 Employees loaded:', empData.length);
        console.log('[useNews] 📰 News loaded:', newsData.length);
        
        setEmployees(empData);
        setNewsList(newsData);
    } catch (err) {
        console.error('[useNews] ❌ Error general:', err);
        toast.error("Error al conectar con el servidor");
    } finally {
        setLoading(false);
        console.log('[useNews] ✅ Carga completada');
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
    const response = await newsApi.updateStatus(id, status);

    // Si hay conflicto, guardar el estado y mostrar el diálogo
    if (response && typeof response === 'object' && 'conflict' in response && response.conflict) {
      setPendingApproval({ id, status });
      setApprovalConflict(response);
      return false; // No cerrar el diálogo de estado
    }

    // Éxito — actualizar la lista
    setNewsList(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    toast.success("Estado actualizado");
    return true;
  } catch (err: any) {
    toast.error(err.message ?? "Error al actualizar estado");
    return false;
  }
};

// Resolver conflicto de aprobación
const resolveApprovalConflict = async (conflictAction: ConflictAction): Promise<boolean> => {
  if (!pendingApproval) return false;

  try {
    const response = await newsApi.updateStatus(
      pendingApproval.id,
      pendingApproval.status,
      conflictAction
    );

    // Si aún hay conflicto (no debería pasar)
    if (response && typeof response === 'object' && 'conflict' in response && response.conflict) {
      toast.error("Error inesperado al resolver conflicto");
      return false;
    }

    const messages: Record<string, string> = {
      cancel: "Novedad aprobada y citas canceladas",
      keep: "Novedad aprobada — citas sin cambios",
      reassign: "Novedad aprobada y citas reasignadas",
    };
    toast.success(messages[conflictAction.action] ?? "Novedad aprobada");

    setApprovalConflict(null);
    setPendingApproval(null);
    await reload();
    return true;
  } catch (err: any) {
    toast.error(err.message ?? "Error al aprobar novedad");
    return false;
  }
};

const dismissApprovalConflict = () => {
  setApprovalConflict(null);
  setPendingApproval(null);
};


return {
    employees, newsList, loading, loggedEmployeeId,
    createOrUpdate, remove, updateStatus,
    conflict, resolveConflict, dismissConflict,
    approvalConflict, resolveApprovalConflict, dismissApprovalConflict,
};
}