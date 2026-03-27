export interface DashboardStats {
  ventasTotales:        number;
  ventasChange:         string;
  clientesActivos:      number;
  citasDelPeriodo:      number;
  citasChange:          string;
  serviciosCompletados: number;
  serviciosChange:      string;
}

export interface DashboardData {
  stats:        DashboardStats;
  salesData:    { month: string; ventas: number; servicios: number }[];
  servicesData: { name: string; value: number; revenue: number }[];
}