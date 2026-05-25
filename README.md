# BodegaGestión - Sistema de Gestión de Almacenamiento

**Bodegas YEIJU** — Sistema de gestión integral de bodegas, inventario y contratos.

---

## Arquitectura Tecnológica

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18.2 + TypeScript + Vite |
| **Backend** | Spring Boot 3.2 + Java 17 |
| **Base de Datos** | Supabase (PostgreSQL 15) |
| **Auth** | Supabase Auth + JWT + RBAC |
| **Edge Functions** | Supabase Edge Functions (Deno) |
| **Hosting DB** | Supabase Cloud |

## Estructura del Proyecto

```
bodega-gestion/
├── backend/                          # (raíz actual - Spring Boot)
│   ├── src/main/java/com/bodega/gestion/
│   │   ├── config/                   # SecurityConfig, CORS
│   │   ├── controller/               # REST endpoints
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── entity/                   # Entidades JPA
│   │   ├── enums/                    # RolUsuario, EstadoBodega, TipoMovimiento
│   │   ├── exception/                # Manejo de errores
│   │   ├── repository/              # Interfaces JpaRepository
│   │   ├── security/                # JWT Filter, Supabase validation
│   │   └── service/                # Lógica de negocio
│   └── src/main/resources/
│       ├── application.yml          # Configuración (env vars)
│       ├── application-local.yml.example  # Template local
│       └── db/schema.sql            # Schema SQL para Supabase
├── frontend/                         # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/                      # Cliente Axios + servicios
│   │   ├── components/               # Layout, UI, Forms
│   │   ├── contexts/                 # AuthContext
│   │   ├── hooks/                    # Custom hooks
│   │   ├── lib/                      # Supabase client
│   │   ├── pages/                    # Páginas por rol
│   │   ├── styles/                   # CSS global
│   │   └── types/                    # TypeScript interfaces
│   └── .env.example                  # Template de variables
├── supabase/                          # Edge Functions
│   └── functions/
│       ├── validar-capacidad/
│       ├── notificaciones/
│       └── webhook-contratos/
├── SUPABASE_SETUP.md                 # Guía de configuración
├── pom.xml                            # Maven config
└── .gitignore
```

## Roles de Usuario (RBAC)

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Control total (CRUDs), auditoría, métricas globales |
| **USUARIO** (Arrendatario) | Gestión de sus bodegas, inventario, movimientos |
| **SEGURIDAD** | Registro de entradas/salidas de personas |

## Módulos del Sistema

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| **Auth** | `/auth/sync`, `/auth/me` | Sincronización con Supabase Auth |
| **Bodegas** | CRUD `/bodegas` | Gestión de bodegas (solo Admin) |
| **Zonas** | CRUD `/zonas` | Mapa lógico de ubicaciones (RF-05) |
| **Objetos** | CRUD `/objetos` | Inventario con dimensiones y volumen |
| **Movimientos** | `/movimientos` | Entradas/Salidas con validación volumétrica |
| **Contratos** | CRUD `/contratos` | Vinculación usuario-bodega |
| **Accesos** | `/accesos/entrada`, `/accesos/{id}/salida` | Bitácora de personas (RF-10) |
| **Auditoría** | `/admin/audit` | Logs inmutables (solo Admin) |
| **Dashboard** | `/dashboard/admin`, `/dashboard/usuario` | Métricas financieras, ocupación, alertas y analítica |

## Configuración Inicial

Ver **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** para la guía paso a paso.

### Resumen rápido:

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `schema.sql` en SQL Editor
3. Configurar credenciales en `application-local.yml`
4. Crear archivo `.env` en frontend con las credenciales

### Ejecutar backend

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Ejecutar frontend

```bash
cd frontend
npm install
npm run dev
```

### Desplegar Edge Functions

```bash
supabase functions deploy validar-capacidad
supabase functions deploy notificaciones
```

## Endpoints Principales

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/auth/sync` | Público | Sincronizar perfil tras login |
| GET | `/auth/me` | Auth | Obtener perfil propio |
| GET | `/bodegas` | Auth | Listar bodegas |
| POST | `/bodegas` | Admin | Crear bodega |
| PUT | `/bodegas/{id}` | Admin | Actualizar bodega |
| DELETE | `/bodegas/{id}` | Admin | Eliminar bodega |
| GET | `/zonas/bodega/{id}` | Auth | Zonas de una bodega |
| POST | `/zonas` | Admin | Crear zona |
| GET | `/objetos/mis-objetos` | Auth | Mi inventario |
| POST | `/objetos` | Auth | Registrar objeto |
| GET | `/objetos/alertas-stock` | Auth | Objetos bajo stock mínimo |
| POST | `/movimientos` | Auth | Registrar entrada/salida |
| GET | `/movimientos/bodega/{id}` | Auth | Trazabilidad por bodega |
| GET | `/contratos/mis-contratos` | Auth | Mis contratos y bodegas asignadas |
| POST | `/contratos` | Admin | Crear contrato |
| PATCH | `/contratos/{id}/terminar` | Admin | Terminar contrato |
| POST | `/accesos/entrada` | Seguridad | Registrar entrada |
| PATCH | `/accesos/{id}/salida` | Seguridad | Registrar salida |
| GET | `/dashboard/admin` | Admin | Dashboard con métricas financieras, ocupación, clientes activos |
| GET | `/dashboard/usuario` | Auth | Dashboard del arrendatario con alertas de stock y capacidad |
| GET | `/admin/audit` | Admin | Logs de auditoría |

## Funcionalidades por Módulo

### Módulo Administrativo (ADMIN)
- CRUD de bodegas con visualización de barras de ocupación
- Gestión de clientes (crear, activar/desactivar, cambiar rol)
- Administración de contratos (crear, terminar, filtrar por vencer)
- **Dashboard financiero**: ingresos mensuales, clientes activos, ocupación global
- **Ranking de productos** que más espacio ocupan
- Logs de auditoría con filtro por tabla

### Módulo del Cliente (USUARIO)
- **Dashboard personalizado** con KPIs y alertas
- **Alertas visuales**: stock bajo mínimo y bodegas >80% de capacidad
- **Gestión de inventario**: CRUD de objetos con dimensiones, stock mínimo y volumen automático
- **Registro de movimientos**: entradas/salidas con validación de capacidad
- **Historial de movimientos** con trazabilidad completa
- **Visualización de bodegas**: info de contrato, ocupación, canon mensual
- **Plano digital 2D** de zonas con colores por nivel de ocupación

### Módulo de Seguridad (SEGURIDAD)
- Registro de entradas/salidas de personas por bodega
- Historial de accesos por persona

### Lógica de Negocio
- **Volumen automático:** `Volumen = Largo(cm) × Ancho(cm) × Alto(cm) / 1,000,000` → m³
- **Validación RF-09:** Al registrar movimientos, se verifica que el volumen total no exceda la capacidad
- **Estados de bodega:** `LIBRE` → `RESERVADA` → `EN_USO` (transición automática con contratos)
- **Triggers SQL:** Recálculo automático de volumen ocupado al insertar/actualizar/eliminar objetos
- **Alertas automáticas:** Stock bajo mínimo y bodegas >80% ocupación visibles en dashboard

## Flujo de Autenticación

```
Frontend → Supabase Auth (login) → JWT emitido
Frontend → POST /auth/sync con JWT → Spring Boot crea/actualiza perfil
Frontend → Cualquier endpoint con Authorization: Bearer <JWT>
Spring Boot → Valida JWT con SUPABASE_JWT_SECRET → Autoriza según rol
```