# Fix: Restricción de Empleado en Módulo de Novedades

## 🎯 Problema

En el módulo de novedades, los empleados podían seleccionar cualquier empleado al crear una novedad, cuando deberían estar restringidos a crear novedades solo para su propio perfil (similar al módulo de citas).

## 📋 Cambios Realizados

### 1. ✅ Componente NewsForm.tsx

**Archivo**: `src/features/news/components/NewsForm.tsx`

#### Cambios:
1. **Agregadas props nuevas**:
   ```tsx
   loggedEmployeeId?: string | null;
   userRole?: string;
   ```

2. **Auto-selección del empleado logueado**:
   ```tsx
   const isEmployee = userRole && userRole !== "admin" && userRole !== "administrador";
   
   useEffect(() => {
     if (isEmployee && loggedEmployeeId && !editingNews && !formData.employeeId) {
       const emp = employees.find(e => String(e.id) === String(loggedEmployeeId));
       if (emp) {
         setFormData(prev => ({
           ...prev,
           employeeId: String(emp.id),
           employeeName: emp.name,
         }));
       }
     }
   }, [isEmployee, loggedEmployeeId, editingNews, formData.employeeId, employees, setFormData]);
   ```

3. **Campo de empleado bloqueado para empleados**:
   ```tsx
   {isEmployee ? (
     // Campo bloqueado mostrando el nombre del empleado
     <div className="w-full h-10 px-3 border border-gray-200 bg-gray-50 rounded-md flex items-center text-sm text-gray-700">
       {formData.employeeName || "Cargando..."}
     </div>
   ) : (
     // Selector normal para administradores
     <Select value={formData.employeeId} onValueChange={handleEmployeeChange}>
       ...
     </Select>
   )}
   ```

4. **Mensaje informativo para empleados**:
   ```tsx
   {isEmployee && (
     <p className="text-xs text-gray-500 flex items-center gap-1">
       <Info className="w-3 h-3" />
       Solo puedes crear novedades para tu propio perfil
     </p>
   )}
   ```

### 2. ✅ Backend (Ya estaba correcto)

**Archivo**: `backend-highsoft-sena/src/controllers/news.controller.js`

El backend ya tenía la lógica correcta:
- Detecta si el usuario es empleado
- Fuerza el `employeeId` al ID del empleado logueado
- Filtra las novedades para mostrar solo las del empleado logueado

```javascript
const esEmpleado = !["admin", "administrador", "cliente"].includes(rol);

if (esEmpleado) {
  const empRecord = await prisma.empleado.findFirst({
    where: { usuarioId: req.usuario.id },
    select: { id: true }
  });
  if (!empRecord) {
    return res.status(400).json({ error: "No se encontró un perfil de empleado asociado a tu cuenta." });
  }
  employeeId = String(empRecord.id);
}
```

### 3. ✅ Hook useNews.ts (Ya estaba correcto)

**Archivo**: `src/features/news/hooks/useNews.ts`

El hook ya obtenía correctamente el `loggedEmployeeId` desde `/auth/me`:

```typescript
const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
const rol = usuario.rol?.toLowerCase();

let empId: string | null = null;

if (rol === "empleado" || rol === "barbero") {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.ok) {
    const meData = await response.json();
    if (meData.perfil?.id) {
      empId = String(meData.perfil.id);
    }
  }
}

setLoggedEmployeeId(empId);
```

### 4. ✅ Tabla NewsTable.tsx (Ya estaba correcto)

**Archivo**: `src/features/news/components/NewsTable.tsx`

La tabla ya tenía las restricciones correctas:
- Solo admin puede cambiar el estado
- Solo admin ve botones de editar y eliminar
- Empleados solo ven el botón de "Ver detalles"

## 🔐 Permisos por Rol

### Administrador (admin)
- ✅ Ver todas las novedades
- ✅ Crear novedades para cualquier empleado
- ✅ Editar cualquier novedad
- ✅ Eliminar cualquier novedad
- ✅ Cambiar estado de novedades

### Empleado (barbero, empleado, etc.)
- ✅ Ver solo sus propias novedades
- ✅ Crear novedades solo para sí mismo (campo bloqueado)
- ❌ Editar novedades
- ❌ Eliminar novedades
- ❌ Cambiar estado de novedades

### Cliente (client)
- ❌ No tiene acceso al módulo de novedades

## 🧪 Cómo Probar

### Como Empleado (Barbero):
1. Inicia sesión con un usuario empleado (ej: Daniel Jaramillo - Barbero)
2. Ve al módulo de "Novedades"
3. Haz clic en "Nueva Novedad"
4. **Resultado esperado**:
   - El campo "Empleado" debe mostrar tu nombre y estar bloqueado (fondo gris)
   - Debe aparecer el mensaje: "Solo puedes crear novedades para tu propio perfil"
   - No deberías poder seleccionar otro empleado
5. En la tabla de novedades:
   - Solo deberías ver tus propias novedades
   - Solo deberías ver el botón de "ojo" (👁️) para ver detalles
   - NO deberías ver botones de editar (✏️) o eliminar (🗑️)

### Como Administrador:
1. Inicia sesión con un usuario administrador
2. Ve al módulo de "Novedades"
3. Haz clic en "Nueva Novedad"
4. **Resultado esperado**:
   - El campo "Empleado" debe ser un selector desplegable
   - Deberías poder seleccionar cualquier empleado
   - En la tabla, deberías ver todas las novedades de todos los empleados
   - Deberías ver todos los botones de acción (👁️ ✏️ 🗑️)
   - Deberías poder cambiar el estado de las novedades

## 📊 Comparación con Módulo de Citas

El módulo de novedades ahora funciona de manera consistente con el módulo de citas:

| Característica | Citas | Novedades |
|----------------|-------|-----------|
| Empleado auto-seleccionado | ✅ | ✅ |
| Campo empleado bloqueado | ✅ | ✅ |
| Mensaje informativo | ✅ | ✅ |
| Solo ve sus propios registros | ✅ | ✅ |
| No puede editar | ✅ | ✅ |
| No puede eliminar | ✅ | ✅ |

## 🔒 Seguridad

### Frontend (UX)
- Campo bloqueado visualmente
- Mensaje informativo
- Botones ocultos

### Backend (Seguridad Real)
- Validación de rol
- Forzado de employeeId
- Filtrado de resultados por empleado

Aunque el campo esté bloqueado en el frontend, el backend valida y fuerza el `employeeId` del empleado logueado, por lo que es imposible crear novedades para otros empleados incluso manipulando la API.

## 📝 Archivos Modificados

- `frontend-highsoft-sena/src/features/news/components/NewsForm.tsx` - Agregado bloqueo de campo empleado

## 📝 Archivos Sin Cambios (ya estaban correctos)

- `backend-highsoft-sena/src/controllers/news.controller.js` - Validaciones backend
- `frontend-highsoft-sena/src/features/news/hooks/useNews.ts` - Obtención de employeeId
- `frontend-highsoft-sena/src/features/news/components/NewsTable.tsx` - Restricciones de botones
- `frontend-highsoft-sena/src/features/news/pages/NewsPage.tsx` - Paso de props

## 🚀 Deployment

### Frontend (Firebase)
```bash
cd frontend-highsoft-sena
npm run build
firebase deploy
```

## ✅ Checklist de Verificación

- [x] Campo empleado bloqueado para empleados
- [x] Campo empleado seleccionable para administradores
- [x] Auto-selección del empleado logueado
- [x] Mensaje informativo para empleados
- [x] Backend valida y fuerza employeeId
- [x] Empleados solo ven sus propias novedades
- [x] Botones de editar/eliminar ocultos para empleados
- [x] Consistencia con módulo de citas
- [x] Documentación creada

## 🔗 Archivos Relacionados

- `src/features/news/components/NewsForm.tsx` - Formulario (MODIFICADO)
- `src/features/news/hooks/useNews.ts` - Lógica de negocio
- `src/features/news/components/NewsTable.tsx` - Tabla de novedades
- `src/features/news/pages/NewsPage.tsx` - Página principal
- `backend-highsoft-sena/src/controllers/news.controller.js` - Validaciones backend
