# NUEVO FORMULARIO DE NOVEDADES V2

## CARACTERÍSTICAS PRINCIPALES

### ✅ **Interfaz Basada en Horarios Semanales**
- Selección de empleado muestra automáticamente su horario semanal
- Visualización clara de días laborales vs días libres
- Navegación por semanas con flechas intuitivas

### ✅ **Selección Inteligente de Días**
- Solo se pueden seleccionar días donde el empleado tiene horario
- Checkboxes con información de horario (ej: "Lunes 08:00-17:00")
- Validación automática de disponibilidad

### ✅ **Tipos de Afectación**
- **Día completo**: Afecta toda la jornada laboral
- **Horario específico**: Permite seleccionar rango de horas dentro de la jornada

### ✅ **Validaciones en Tiempo Real**
- Errores: Campos obligatorios, días sin horario, horarios inválidos
- Advertencias: Horarios fuera de la jornada laboral
- Resumen visual de la selección

## FLUJO DE USO

### 1. **Seleccionar Empleado**
```
Usuario selecciona empleado → Sistema carga horario semanal → Muestra días disponibles
```

### 2. **Navegar por Semanas**
```
Semana actual ← → Semana siguiente
```

### 3. **Seleccionar Días Afectados**
```
✅ Lunes    08:00-17:00  [Disponible]
✅ Martes   08:00-17:00  [Disponible]
❌ Sábado   Sin horario  [No disponible]
```

### 4. **Elegir Tipo de Afectación**
- **Día completo**: Toda la jornada (08:00-17:00)
- **Horario específico**: Ej. 14:00-16:00 (cita médica)

### 5. **Validación y Envío**
- Sistema valida automáticamente
- Muestra resumen antes de enviar
- Convierte a formato API

## COMPONENTES PRINCIPALES

### **NewsFormV2.tsx**
- Formulario principal rediseñado
- Manejo de estado local
- Validaciones en tiempo real

### **useNewsFormV2.ts**
- Hook personalizado para manejo de estado
- Conversión entre formatos (UI ↔ API)
- Validaciones de negocio

### **scheduleService.ts**
- Servicio para obtener horarios de empleados
- Navegación de semanas
- Validaciones de horario

### **mockScheduleService.ts**
- Datos de ejemplo para desarrollo
- Simula diferentes tipos de horarios
- Permite probar sin backend

## DATOS DE EJEMPLO

### **Empleado 1: Juan Pérez**
- Lunes a Viernes: 08:00-17:00
- Horario tradicional de oficina

### **Empleado 2: María García**
- Lunes a Viernes: 09:00-18:00
- Sábado: 08:00-14:00
- Horario extendido con sábado

### **Empleado 3: Carlos López**
- Martes a Domingo: 14:00-22:00
- Horario de turno tarde/noche

## VENTAJAS DEL NUEVO DISEÑO

### **Para el Usuario**
- ✅ Interfaz más intuitiva y visual
- ✅ Menos errores al crear novedades
- ✅ Validación inmediata de disponibilidad
- ✅ Mejor comprensión del impacto

### **Para el Sistema**
- ✅ Datos más consistentes
- ✅ Validación automática contra horarios
- ✅ Mejor integración con módulo de horarios
- ✅ Preparado para futuras funcionalidades

### **Para el Negocio**
- ✅ Reduce conflictos de programación
- ✅ Mejora planificación de recursos
- ✅ Facilita gestión de excepciones
- ✅ Aumenta eficiencia operativa

## MIGRACIÓN DESDE V1

### **Campos Mapeados**
```typescript
// V1 → V2
date → selectedDays[0] (convertido a índice de día)
fechaFinal → selectedDays[n] (múltiples días)
startTime/endTime → startTime/endTime (si affectationType = "partial_hours")
```

### **Nuevos Campos**
```typescript
selectedWeekStart: string;     // Semana base para navegación
selectedDays: number[];        // Índices de días (0=Lun, 6=Dom)
affectationType: string;       // "full_day" | "partial_hours"
```

## PRÓXIMOS PASOS

### **Fase 1: Integración Backend**
- [ ] Conectar con API real de horarios
- [ ] Implementar validaciones del lado servidor
- [ ] Manejar conflictos con citas existentes

### **Fase 2: Funcionalidades Avanzadas**
- [ ] Novedades recurrentes (ej: todos los lunes)
- [ ] Plantillas de novedades frecuentes
- [ ] Notificaciones automáticas

### **Fase 3: Optimizaciones**
- [ ] Cache de horarios de empleados
- [ ] Carga lazy de semanas
- [ ] Modo offline básico

## TESTING

### **Para Probar la Interfaz**
1. Ir a la página de Novedades V2
2. Hacer clic en "Nueva Novedad"
3. Seleccionar un empleado (datos mock disponibles)
4. Navegar por semanas y seleccionar días
5. Probar validaciones y tipos de afectación

### **Casos de Prueba**
- ✅ Empleado con horario L-V
- ✅ Empleado con horario L-S
- ✅ Empleado con horario de turno
- ✅ Selección de día completo
- ✅ Selección de horario específico
- ✅ Validaciones de error
- ✅ Navegación entre semanas