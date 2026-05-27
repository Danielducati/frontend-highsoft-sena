# Fix: Reglas de Tipos de Novedades

## 🎯 Cambios Implementados

Se han ajustado las reglas del formulario de novedades para que cada tipo tenga comportamientos específicos según sus necesidades.

## 📋 Reglas por Tipo de Novedad

### 1. 🕐 Retraso
- **Duración**: ⚠️ Solo un día (fecha fin = fecha inicio, bloqueada)
- **Horario**: ✅ Requiere horario registrado
- **Horas**: ✅ Obligatorias (debe indicar hora inicio y fin)
- **Validación**: El empleado debe tener horario registrado para el día seleccionado

**Uso típico**: Empleado llega tarde y solo afecta parte del día

### 2. 🚫 Ausencia
- **Duración**: ⚠️ Solo un día (fecha fin = fecha inicio, bloqueada)
- **Horario**: ✅ Requiere horario registrado
- **Horas**: ⚪ Opcionales (puede indicar hora inicio y fin, o dejar vacío para todo el día)
- **Validación**: El empleado debe tener horario registrado para el día seleccionado

**Uso típico**: Empleado no asiste un día completo o parte del día

### 3. 📝 Permiso
- **Duración**: ✅ Puede ser varios días (fecha fin editable)
- **Horario**: ❌ NO requiere horario registrado
- **Horas**: ❌ No aplica
- **Validación**: Puede seleccionar cualquier día, tenga o no horario

**Uso típico**: Permiso personal, cita médica, trámites que pueden durar varios días

### 4. 🏥 Incapacidad
- **Duración**: ✅ Puede ser varios días (fecha fin editable)
- **Horario**: ❌ NO requiere horario registrado
- **Horas**: ❌ No aplica
- **Validación**: Puede seleccionar cualquier día, tenga o no horario

**Uso típico**: Incapacidad médica que puede durar varios días

### 5. 📄 Otro
- **Duración**: ✅ Puede ser varios días (fecha fin editable)
- **Horario**: ❌ NO requiere horario registrado
- **Horas**: ❌ No aplica
- **Validación**: Puede seleccionar cualquier día, tenga o no horario

**Uso típico**: Cualquier otra situación no categorizada

## 🔄 Cambios en el Código

### Archivo Modificado
`src/features/news/components/NewsForm.tsx`

### Constantes Agregadas

```typescript
// Tipos que solo permiten UN DÍA (fecha fin = fecha inicio)
const SINGLE_DAY_ONLY: Array<EmployeeNews["type"]> = ["retraso", "ausencia"];

// Tipos que permiten MÚLTIPLES DÍAS
const MULTIPLE_DAYS_ALLOWED: Array<EmployeeNews["type"]> = ["permiso", "incapacidad"];

// Tipos que NO requieren horario registrado
const NO_SCHEDULE_REQUIRED: Array<EmployeeNews["type"]> = ["permiso", "incapacidad", "otro"];
```

### Lógica de Bloqueo de Fecha Fin

```typescript
const isSingleDayOnly = SINGLE_DAY_ONLY.includes(formData.type);
const allowsMultipleDays = MULTIPLE_DAYS_ALLOWED.includes(formData.type);
const lockEndDate = isSingleDayOnly;
```

### Mensajes Informativos Actualizados

Cada tipo ahora muestra un mensaje claro con su comportamiento:

- **Retraso**: "⚠️ Solo un día. Requiere horario registrado. Debes indicar la franja horaria afectada."
- **Ausencia**: "⚠️ Solo un día. Requiere horario registrado. Las horas son opcionales."
- **Permiso**: "✓ Puede ser varios días. No requiere horario registrado."
- **Incapacidad**: "✓ Puede abarcar varios días. No requiere horario registrado."
- **Otro**: "No requiere horario registrado."

## 📊 Tabla Comparativa

| Tipo | Un Solo Día | Varios Días | Requiere Horario | Horas Obligatorias | Horas Opcionales |
|------|-------------|-------------|------------------|-------------------|------------------|
| Retraso | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ausencia | ✅ | ❌ | ✅ | ❌ | ✅ |
| Permiso | ❌ | ✅ | ❌ | ❌ | ❌ |
| Incapacidad | ❌ | ✅ | ❌ | ❌ | ❌ |
| Otro | ❌ | ✅ | ❌ | ❌ | ❌ |

## 🎨 Cambios Visuales

### Campo "Fecha Fin"

**Para tipos de un solo día (Retraso, Ausencia)**:
- Campo bloqueado (fondo gris)
- Muestra automáticamente la misma fecha que "Fecha Inicio"
- Etiqueta: "Fecha Fin (mismo día)"
- Mensaje: "Retraso/Ausencia solo puede ser de un día"

**Para tipos de varios días (Permiso, Incapacidad)**:
- Campo editable (fondo blanco)
- Permite seleccionar fecha posterior a "Fecha Inicio"
- Etiqueta: "Fecha Fin (puede ser varios días)"
- Sin restricción de días

### Mensajes de Validación

**Cuando requiere horario y no hay horario registrado**:
```
❌ El empleado no tiene horario registrado para este día. Selecciona un día con horario.
```

**Cuando requiere horario y SÍ hay horario registrado**:
```
✅ Horario: 08:00 – 17:00
```

**Cuando NO requiere horario**:
```
ℹ️ Este tipo no requiere horario registrado. Puedes seleccionar cualquier día.
```

### Resumen de la Novedad

El resumen ahora muestra información más clara:

```
📋 Resumen de la novedad
Tipo: Retraso
Fecha: 2026-05-25 (un solo día)
Franja: 09:00 – 10:00
⚠️ Requiere horario: El empleado debe tener horario registrado
```

O para tipos sin restricción:

```
📋 Resumen de la novedad
Tipo: Permiso
Fecha: 2026-05-25 al 2026-05-27
✓ Sin restricción: No requiere horario registrado
```

## 🧪 Cómo Probar

### Caso 1: Retraso (Un solo día, requiere horario, horas obligatorias)

1. Selecciona tipo "Retraso"
2. **Resultado esperado**:
   - Mensaje: "⚠️ Solo un día. Requiere horario registrado..."
   - Campo "Fecha Fin" bloqueado y gris
   - Al seleccionar fecha inicio, fecha fin se sincroniza automáticamente
   - Debe mostrar selector de horas (obligatorio)
   - Solo permite seleccionar días donde el empleado tenga horario

### Caso 2: Ausencia (Un solo día, requiere horario, horas opcionales)

1. Selecciona tipo "Ausencia"
2. **Resultado esperado**:
   - Mensaje: "⚠️ Solo un día. Requiere horario registrado..."
   - Campo "Fecha Fin" bloqueado y gris
   - Selector de horas visible pero opcional
   - Solo permite seleccionar días donde el empleado tenga horario

### Caso 3: Permiso (Varios días, sin restricción de horario)

1. Selecciona tipo "Permiso"
2. **Resultado esperado**:
   - Mensaje: "✓ Puede ser varios días. No requiere horario registrado."
   - Campo "Fecha Fin" editable (fondo blanco)
   - Puede seleccionar cualquier rango de fechas
   - No muestra selector de horas
   - Puede seleccionar días sin horario registrado

### Caso 4: Incapacidad (Varios días, sin restricción de horario)

1. Selecciona tipo "Incapacidad"
2. **Resultado esperado**:
   - Mensaje: "✓ Puede abarcar varios días. No requiere horario registrado."
   - Campo "Fecha Fin" editable (fondo blanco)
   - Puede seleccionar cualquier rango de fechas
   - No muestra selector de horas
   - Puede seleccionar días sin horario registrado

## 🔒 Validaciones

### Frontend
- Bloqueo visual de fecha fin para tipos de un solo día
- Validación de horas obligatorias para retraso
- Validación de horario registrado para retraso y ausencia
- Mensajes claros de error y advertencia

### Backend
El backend ya tiene las validaciones correctas en `news.controller.js`:
- Valida que el empleado tenga horario para tipos que lo requieren
- Valida solapamiento de horarios
- Valida rangos de fechas

## 📝 Archivos Modificados

- `frontend-highsoft-sena/src/features/news/components/NewsForm.tsx` - Reglas de tipos actualizadas

## 🚀 Deployment

```bash
cd frontend-highsoft-sena
npm run build
firebase deploy
```

## ✅ Checklist de Verificación

- [x] Retraso: solo un día, requiere horario, horas obligatorias
- [x] Ausencia: solo un día, requiere horario, horas opcionales
- [x] Permiso: varios días, sin restricción de horario
- [x] Incapacidad: varios días, sin restricción de horario
- [x] Otro: varios días, sin restricción de horario
- [x] Mensajes informativos actualizados
- [x] Validaciones de fecha fin
- [x] Resumen mejorado
- [x] Documentación creada

## 💡 Beneficios

1. **Claridad**: Cada tipo tiene reglas claras y específicas
2. **Prevención de errores**: Validaciones evitan configuraciones inválidas
3. **Flexibilidad**: Permisos e incapacidades no están limitados por horarios
4. **Precisión**: Retrasos y ausencias requieren horario para validación correcta
5. **UX mejorada**: Mensajes claros y campos bloqueados cuando corresponde
