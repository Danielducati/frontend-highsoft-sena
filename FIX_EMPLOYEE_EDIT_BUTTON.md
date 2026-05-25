# Fix: Ocultar botón "Editar" para empleados en citas

## 🎯 Problema

Los empleados podían ver el botón "Editar" en el modal de detalles de las citas, aunque solo deberían poder crear citas, no editarlas.

## 📍 Ubicaciones del Botón Editar

### 1. ✅ Vista de Lista (Ya estaba correcto)
**Archivo**: `src/features/appointments/pages/AppointmentsPage.tsx`  
**Línea**: ~237-250

El botón de editar en la vista de lista YA estaba correctamente restringido a administradores:
```tsx
{userRole === "admin" && (
  <button onClick={() => handleEdit(apt)}>
    <Pencil className="w-4 h-4" />
  </button>
)}
```

### 2. ✅ Modal de Detalles (CORREGIDO)
**Archivo**: `src/features/appointments/components/AppointmentViewDialog.tsx`  
**Línea**: ~107-113

**Antes:**
```tsx
{userRole !== "client" && apt.status !== "completed" && (
  <Button onClick={() => { onEdit(apt); onClose(); }}>
    <Edit className="w-4 h-4 mr-2" />Editar
  </Button>
)}
```

**Después:**
```tsx
{userRole === "admin" && apt.status !== "completed" && (
  <Button onClick={() => { onEdit(apt); onClose(); }}>
    <Edit className="w-4 h-4 mr-2" />Editar
  </Button>
)}
```

### 3. ✅ Vista de Calendario (Ya estaba correcto)
En la vista de calendario, al hacer clic en una cita solo se abre el modal de detalles, por lo que la restricción del modal aplica automáticamente.

## 🔐 Permisos por Rol

### Administrador (admin)
- ✅ Ver citas
- ✅ Crear citas
- ✅ Editar citas
- ✅ Eliminar citas
- ✅ Cambiar estado de citas

### Empleado (barbero, empleado, etc.)
- ✅ Ver citas
- ✅ Crear citas
- ❌ Editar citas (CORREGIDO)
- ❌ Eliminar citas
- ❌ Cambiar estado de citas

### Cliente (client)
- ✅ Ver sus propias citas
- ✅ Crear sus propias citas
- ❌ Editar citas
- ❌ Eliminar citas
- ✅ Cancelar sus propias citas

## 📋 Cambios Realizados

### Archivo Modificado
- `frontend-highsoft-sena/src/features/appointments/components/AppointmentViewDialog.tsx`

### Cambio Específico
Línea 107: Cambió la condición de `userRole !== "client"` a `userRole === "admin"`

## 🧪 Cómo Probar

### Como Empleado (Barbero):
1. Inicia sesión con un usuario empleado (ej: Daniel Jaramillo - Barbero)
2. Ve al módulo de Citas
3. Haz clic en el ícono de "ojo" (👁️) para ver los detalles de cualquier cita
4. **Resultado esperado**: Solo deberías ver el botón "Cerrar", NO el botón "Editar"
5. En la vista de lista, NO deberías ver el ícono de lápiz (✏️) para editar
6. Deberías poder hacer clic en "Nueva Cita" para crear citas

### Como Administrador:
1. Inicia sesión con un usuario administrador
2. Ve al módulo de Citas
3. Haz clic en el ícono de "ojo" (👁️) para ver los detalles de cualquier cita
4. **Resultado esperado**: Deberías ver los botones "Eliminar", "Editar" y "Cerrar"
5. En la vista de lista, deberías ver todos los íconos de acción (👁️ ✏️ 🗑️)

### Como Cliente:
1. Inicia sesión con un usuario cliente
2. Ve al módulo de Citas
3. Solo deberías ver tus propias citas
4. Al ver detalles, solo deberías ver el botón "Cerrar"

## 🚀 Deployment

### Frontend (Firebase)
```bash
cd frontend-highsoft-sena
npm run build
firebase deploy
```

O si usas el script de deploy:
```bash
npm run deploy
```

## 📝 Notas Adicionales

- Este cambio es solo en el frontend (UI)
- El backend ya tiene las validaciones de permisos correctas
- Si un empleado intenta editar una cita manipulando la API directamente, el backend lo rechazará
- La restricción en el frontend es para mejorar la experiencia de usuario y evitar confusiones

## ✅ Checklist de Verificación

- [x] Botón "Editar" oculto en modal de detalles para empleados
- [x] Botón "Editar" visible en modal de detalles para administradores
- [x] Botón "Editar" en vista de lista ya estaba correcto (solo admin)
- [x] Empleados pueden seguir creando citas
- [x] Documentación creada

## 🔗 Archivos Relacionados

- `src/features/appointments/components/AppointmentViewDialog.tsx` - Modal de detalles (MODIFICADO)
- `src/features/appointments/pages/AppointmentsPage.tsx` - Vista principal (sin cambios)
- `src/features/appointments/hooks/useAppointments.ts` - Lógica de negocio
- `backend-highsoft-sena/src/controllers/appointments.controller.js` - Validaciones backend
