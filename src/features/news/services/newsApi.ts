// news/services/newsApi.ts
const API = "https://backend-highsoft-sena-production.up.railway.app";

const authHeaders = () => ({
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

// Servicio en conflicto — un detalle de cita asignado al empleado con novedad
export interface ConflictService {
detalleId:     number;
citaId:        number;
clienteNombre: string;
fecha:         string;
hora:          string;
servicio:      string;
}

// Respuesta cuando hay conflicto
export interface ConflictResponse {
conflict:              true;
message:               string;
servicios:             ConflictService[];
empleadosDisponibles?: Array<{
    id:        number;
    name:      string;
    specialty: string;
}>;
}

// Cita afectada por aprobación de novedad
export interface AffectedAppointment {
citaId:           number;
detalleId:        number;
fecha:            string;
hora:             string;
servicio:         string;
cliente:          string;
clienteContacto:  {
    correo?:   string;
    telefono?: string;
};
}

// Empleado disponible para reasignación
export interface AvailableEmployee {
id:           number;
nombre:       string;
especialidad: string;
}

// Opción de resolución de conflicto
export interface ConflictOption {
action:              string;
label:               string;
description:         string;
requiresEmployeeId?: boolean;
}

// Respuesta de conflicto al aprobar novedad
export interface ApprovalConflictResponse {
conflict:              true;
message:               string;
novedad:               {
    id:          number;
    tipo:        string;
    empleado:    string;
    fechaInicio: string;
    fechaFinal:  string;
    horaInicio?: string;
    horaFinal?:  string;
};
citasAfectadas:        AffectedAppointment[];
empleadosDisponibles:  AvailableEmployee[];
opciones:              ConflictOption[];
}

// Acción que toma el usuario al resolver el conflicto
export type ConflictAction =
| { action: "cancel" }                                    // cancelar las citas
| { action: "keep" }                                      // no hacer nada
| { action: "reassign"; reassignToEmployeeId: string };   // reasignar servicios

export const newsApi = {

getAll: async () => {
    const res = await fetch(`${API}/news`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar novedades");
    return res.json();
},

getEmployees: async () => {
    const res = await fetch(`${API}/employees?activos=true`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar empleados");
    const data = await res.json();
    return data.map((e: any) => ({
    id:        e.id ?? e.PK_id_empleado,
    name:      `${e.nombre} ${e.apellido}`,
    specialty: e.especialidad ?? "",
    }));
},

// Crear novedad
// - Primera llamada: sin conflictAction → puede devolver ConflictResponse
// - Segunda llamada: con conflictAction → el usuario ya decidió qué hacer
create: async (
    formData: any,
    conflictAction?: ConflictAction
): Promise<{ ok: boolean } | ConflictResponse> => {
    const res = await fetch(`${API}/news`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify({
        ...formData,
        ...conflictAction, // spread: action, y opcionalmente reassignToEmployeeId
    }),
    });

    const data = await res.json();
    if (res.status === 409) return data as ConflictResponse;
    if (!res.ok) throw new Error(data.error ?? "Error al crear novedad");
    return data;
},

update: async (id: number, formData: any) => {
    const res = await fetch(`${API}/news/${id}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Error al actualizar novedad");
    return res.json();
},

updateStatus: async (
    id: number,
    status: string,
    conflictAction?: ConflictAction
): Promise<{ ok: boolean; message?: string } | ApprovalConflictResponse> => {
    const body: any = { status };
    
    // Si hay conflictAction, agregar action y opcionalmente reassignToEmployeeId
    if (conflictAction) {
        body.action = conflictAction.action;
        if (conflictAction.action === "reassign" && "reassignToEmployeeId" in conflictAction) {
            body.reassignToEmployeeId = Number(conflictAction.reassignToEmployeeId);
        }
    }

    const res = await fetch(`${API}/news/${id}/status`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify(body),
    });

    const data = await res.json();
    if (res.status === 409) return data as ApprovalConflictResponse;
    if (!res.ok) throw new Error(data.error ?? "Error al actualizar estado");
    return data;
},

remove: async (id: number) => {
    const res = await fetch(`${API}/news/${id}`, {
    method:  "DELETE",
    headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar novedad");
    return res.json();
},
};