export interface DashboardStats {
  ventasTotales:        number;
  ventasChange:         string;
  clientesActivos:      number;
  citasDelPeriodo:      number;
  citasChange:          string;
  serviciosCompletados: number;
  serviciosChange:      string;
  ventasCompletadas: number
  ventasCountChange: string
}

export interface DashboardData {
  stats:        DashboardStats;
  salesData:    { month: string; ventas: number; servicios: number }[];
  servicesData: { name: string; value: number; revenue: number }[];
  cancelRate?: { total: number; cancelled: number; rate: string };
  upcomingAppointments?: Array<{
    id: number;
    fecha: string;
    hora: string;
    clienteName: string;
    employeeName: string;
    estado: string;
  }>;
  clientesNuevos?: number;
}