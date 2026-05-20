# Guía de Configuración de Supabase - BodegaGestión

## 1. Crear el proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión o créate una cuenta
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name:** `bodega-gestion`
   - **Database Password:** Genera una contraseña segura y guárdala
   - **Region:** Selecciona la más cercana a tus usuarios (ej: `South America (São Paulo)`)
   - **Plan:** Free (para desarrollo)
4. Espera ~2 minutos mientras se crea el proyecto

## 2. Obtener las credenciales

Una vez creado el proyecto, ve a **Settings > API**:

| Credencial | Dónde encontrarla | Variable de entorno |
|---|---|---|
| **Project URL** | Settings > API > Project URL | `SUPABASE_URL` |
| **anon public key** | Settings > API > Project API keys > anon public | `SUPABASE_ANON_KEY` |
| **JWT Secret** | Settings > API > JWT Secret (click "Reveal") | `SUPABASE_JWT_SECRET` |
| **Service Role Key** | Settings > API > Project API keys > service_role (click "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

### Para la conexión a la base de datos:

Ve a **Settings > Database**:

| Credencial | Variable de entorno |
|---|---|
| **Connection string (URI)** | `SPRING_DATASOURCE_URL` |
| **Database password** | `SPRING_DATASOURCE_PASSWORD` |

La URI tendrá este formato:
```
jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres
```

> **Nota:** Usa el **Connection Pooler** (puerto 5432) para la conexión desde Spring Boot, no la conexión directa.

## 3. Ejecutar el Schema SQL

1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New Query"**
3. Copia y pega el contenido completo del archivo `src/main/resources/db/schema.sql`
4. Haz clic en **"Run"**
5. Verifica que no haya errores en la consola

## 4. Configurar autenticación

1. Ve a **Authentication > Providers**
2. Asegúrate de que **Email/Password** esté habilitado
3. En **Authentication > Settings**:
   - **Site URL:** `http://localhost:5173` (para desarrollo)
   - **Redirect URLs:** Agrega `http://localhost:5173/**`
4. **⚠️ IMPORTANTE PARA DESARROLLO:** En **Authentication > Settings**:
   - Desactiva **"Confirm email"** para que los usuarios puedan iniciar sesión inmediatamente sin confirmar su correo
   - Opcionalmente desactiva **"Secure email change"**
5. En **Authentication > Email Templates** puedes personalizar los templates de confirmación

> **Si ya creaste un usuario y tiene `confirmed_at = null`:** Ve a **Authentication > Users**, selecciona el usuario y haz clic en **"Confirm"** para confirmarlo manualmente.

## 5. Configurar variables de entorno locales

Crea el archivo `src/main/resources/application-local.yml` con tus credenciales:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres
    username: postgres.<project-ref>
    password: <tu-database-password>

supabase:
  url: https://<project-ref>.supabase.co
  anon-key: <tu-anon-key>
  jwt-secret: <tu-jwt-secret>
  service-role-key: <tu-service-role-key>
```

> **IMPORTANTE:** Este archivo está en `.gitignore` y NUNCA debe subirse al repositorio.

## 6. Ejecutar el backend

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

La API estará disponible en: `http://localhost:8080/api/v1`

## 7. Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 8. Configurar roles de usuario en Supabase

Después de registrar un usuario desde el frontend, puedes asignarle un rol desde el panel de Supabase:

1. Ve a **Authentication > Users**
2. Selecciona el usuario
3. En **App Metadata**, agrega:
   ```json
   {
     "role": "ADMIN"
   }
   ```
4. Los roles disponibles son: `ADMIN`, `USUARIO`, `SEGURIDAD`

> **Nota:** El rol por defecto al registrarse es `USUARIO`. Solo un ADMIN puede cambiar roles desde la API.

## Estructura de variables de entorno

Para producción, configura estas variables de entorno en tu servicio de hosting:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_PASSWORD=<password>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_JWT_SECRET=<jwt-secret>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```