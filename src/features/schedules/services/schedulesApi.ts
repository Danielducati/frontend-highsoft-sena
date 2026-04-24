// schedules/services/schedulesApi.ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const authHeaders = () => ({
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
});

async function throwIfError(res: Response, fallback: string): Promise<void> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? fallback);
  }
}

export const schedulesApi = {

getAll: async () => {
    const res = await fetch(`${API}/schedules`, { headers: authHeaders() });
    await throwIfError(res, "Error al cargar horarios");
    return res.json();
},

getEmployees: async () => {
    const res = await fetch(`${API}/employees`, { headers: authHeaders() });
    await throwIfError(res, "Error al cargar empleados");
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
    await throwIfError(res, "Error al crear horario");
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
    await throwIfError(res, "Error al actualizar horario");
    return res.json();
},

remove: async (employeeId: string, weekStartDate: string) => {
    const res = await fetch(`${API}/schedules/${employeeId}/${weekStartDate}`, {
    method:  "DELETE",
    headers: authHeaders(),
    });
    await throwIfError(res, "Error al eliminar horario");
    return res.json();
},
};