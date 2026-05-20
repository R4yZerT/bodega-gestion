# Supabase Edge Functions

Este directorio contiene las Edge Functions de Supabase para BodegaGestión.

## Funciones disponibles

### `validar-capacidad`
Valida que el volumen adicional de objetos no exceda la capacidad de una bodega.
- **Input:** `{ "bodegaId": number, "volumenAdicional": number }`
- **Output:** Información de la bodega y si excede la capacidad

### `notificaciones`
Genera alertas de stock mínimo, bodegas con alta ocupación y contratos por vencer.
- **Sin input requerido** (se ejecuta como cron o bajo demanda)
- **Output:** Listas de alertas por categoría

### `webhook-contratos`
Webhook para notificar cuando los contratos están próximos a vencer.
- **Se configura como webhook en Supabase Dashboard**

## Despliegue

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular al proyecto
supabase link --project-ref <tu-project-ref>

# Desplegar todas las funciones
supabase functions deploy

# Desplegar una función específica
supabase functions deploy validar-capacidad
```

## Pruebas locales

```bash
# Iniciar Supabase local
supabase start

# Probar una función
supabase functions serve validar-capacidad --env-file .env.local
```