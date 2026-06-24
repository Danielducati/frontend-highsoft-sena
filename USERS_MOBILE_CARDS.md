# 📱 Vista Responsive - Tarjetas Móviles en Usuarios

## Problema Solucionado

La tabla de usuarios no era realmente responsive. Aunque tenía scroll horizontal, en pantallas pequeñas era difícil de usar porque las columnas eran muy anchas y se perdía contexto al hacer scroll.

## Solución Implementada

Se implementó un **diseño dual** usando las clases de Tailwind para responsive:

### 1. Vista Desktop (md y superior)
- **Tabla tradicional** con todas las columnas
- `className="hidden md:block"` - Se oculta en móviles
- `minWidth: "800px"` en la tabla para mantener diseño consistente
- Scroll horizontal cuando sea necesario

### 2. Vista Mobile (< md)
- **Tarjetas verticales** con toda la información
- `className="block md:hidden"` - Solo visible en móviles
- Diseño adaptado con información organizada verticalmente
- Sin scroll horizontal necesario

## Estructura de las Tarjetas Mobile

Cada tarjeta incluye:

1. **Header**:
   - Avatar grande (48x48px)
   - Nombre y documento
   - Switch de estado a la derecha

2. **Información del usuario**:
   - Icono + Badge de rol
   - Icono + Email (con word-break para emails largos)
   - Icono + Teléfono (si existe)

3. **Acciones** (separadas por border-top):
   - Botones expandidos horizontalmente
   - Iconos + texto descriptivo
   - Estados disabled visualmente claros

## Código Clave

### Vista Desktop
```tsx
<div style={{ overflowX: "auto" }} className="hidden md:block">
  <table style={{ width: "100%", minWidth: "800px" }}>
    {/* Tabla tradicional */}
  </table>
</div>
```

### Vista Mobile
```tsx
<div className="block md:hidden" style={{ padding: 16 }}>
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {paginatedUsers.map((user) => (
      <div key={`mobile-${user.id}`} style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        {/* Contenido de la tarjeta */}
      </div>
    ))}
  </div>
</div>
```

## Breakpoint Usado

- **md (768px)**: Es el punto de quiebre entre mobile y desktop
  - `< 768px`: Tarjetas verticales
  - `≥ 768px`: Tabla horizontal

## Beneficios

✅ **Mejor UX en móviles**: No necesitas hacer scroll horizontal
✅ **Toda la información visible**: Cada tarjeta muestra todos los datos del usuario
✅ **Acciones claras**: Botones más grandes y fáciles de tocar
✅ **Mantiene funcionalidad desktop**: La tabla sigue igual en pantallas grandes
✅ **Consistente con otros módulos**: Mismo patrón que horarios y otros módulos

## Características Mobile

### Acciones Táctiles
- Botones más grandes (padding: "8px 12px")
- Texto descriptivo además de iconos
- Separación clara entre acciones

### Información Densa pero Legible
- Avatar más grande para mejor visualización
- Email con `wordBreak: "break-word"` para evitar overflow
- Iconos pequeños (14x14) como guías visuales
- Espaciado generoso (gap: 12px entre tarjetas)

### Estados Visuales
- Switch de estado mantiene la misma funcionalidad
- Botones deshabilitados claramente diferenciados
- Colores consistentes con la marca

## Testing Recomendado

1. **Probar en diferentes tamaños**:
   - 320px (móviles pequeños)
   - 375px (iPhone estándar)
   - 768px (tablets)
   - 1024px+ (desktop)

2. **Verificar funcionalidad**:
   - Toggle de estado funciona en ambas vistas
   - Botones de acción responden correctamente
   - Emails largos no rompen el layout
   - Todas las acciones son accesibles

3. **Performance**:
   - Las tarjetas se renderizan eficientemente
   - No hay lag al hacer scroll
   - Cambio de vista es instantáneo al resize

## Fecha de Implementación
19 de junio de 2026
