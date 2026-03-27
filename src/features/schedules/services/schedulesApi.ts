// schedules/services/schedulesApi.ts
const API = "http://localhost:3001";

const authHeaders = () => ({
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

export const schedulesApi = {

getAll: async () => {
    const res = await fetch(`${API}/schedules`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar horarios");
    return res.json();
},

getEmployees: async () => {
    const res = await fetch(`${API}/employees`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Error al cargar empleados");
    const data = await res.json();
    return data.map((e: any) => ({
    id:        String(e.id ?? e.PK_id_empleado),
    name:      `${e.nombre} ${e.apellido}`,
    specialty: e.especialidad ?? "",
    }));
},

create: async (payload: {
    employeeId:    string;
    weekStartDate: string;
    daySchedules:  { dayIndex: number; startTime: string; endTime: string }[];
}) => {
    const res = await fetch(`${API}/schedules`, {
    method:  "POST",
    headers: authHeaders(),
    body:    JSON.stringify(payload),
    });
    if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al crear horario");
    }
    return res.json();
},

update: async (
    employeeId:    string,
    weekStartDate: string,
    daySchedules:  { dayIndex: number; startTime: string; endTime: string }[]
) => {
    const res = await fetch(`${API}/schedules/${employeeId}/${weekStartDate}`, {
    method:  "PUT",
    headers: authHeaders(),
    body:    JSON.stringify({ daySchedules }),
    });
    if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al actualizar horario");
    }
    return res.json();
},

remove: async (employeeId: string, weekStartDate: string) => {
    const res = await fetch(`${API}/schedules/${employeeId}/${weekStartDate}`, {
    method:  "DELETE",
    headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Error al eliminar horario");
    return res.json();
},
};