-- ============================================================
-- BodegaGestión - Schema SQL para Supabase (PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id                    UUID PRIMARY KEY,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo       VARCHAR(255),
    numero_identificacion VARCHAR(50),
    rol                   VARCHAR(20) NOT NULL DEFAULT 'USUARIO'
                          CHECK (rol IN ('ADMIN', 'USUARIO', 'SEGURIDAD')),
    activo                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bodegas (
    id                  BIGSERIAL PRIMARY KEY,
    nombre              VARCHAR(255) NOT NULL,
    ubicacion           VARCHAR(500) NOT NULL,
    capacidad_m3        NUMERIC(10,3) NOT NULL,
    volumen_ocupado_m3  NUMERIC(10,3) NOT NULL DEFAULT 0,
    estado              VARCHAR(20) NOT NULL DEFAULT 'LIBRE'
                        CHECK (estado IN ('LIBRE', 'RESERVADA', 'EN_USO')),
    descripcion         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zonas (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    descripcion TEXT,
    bodega_id   BIGINT NOT NULL REFERENCES bodegas(id) ON DELETE CASCADE,
    capacidad_m3 NUMERIC(10,3) NOT NULL,
    volumen_ocupado_m3 NUMERIC(10,3) NOT NULL DEFAULT 0,
    posicion_x  INTEGER NOT NULL DEFAULT 0,
    posicion_y  INTEGER NOT NULL DEFAULT 0,
    ancho       INTEGER NOT NULL DEFAULT 1,
    alto        INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(255) NOT NULL,
    descripcion TEXT,
    usuario_id  UUID REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS objetos (
    id           BIGSERIAL PRIMARY KEY,
    nombre       VARCHAR(255) NOT NULL,
    cantidad     INTEGER NOT NULL CHECK (cantidad >= 0),
    largo_cm     NUMERIC(8,2),
    ancho_cm     NUMERIC(8,2),
    alto_cm      NUMERIC(8,2),
    stock_minimo INTEGER,
    categoria_id BIGINT REFERENCES categorias(id) ON DELETE SET NULL,
    bodega_id    BIGINT NOT NULL REFERENCES bodegas(id) ON DELETE RESTRICT,
    zona_id      BIGINT REFERENCES zonas(id) ON DELETE SET NULL,
    usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contratos (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    UUID NOT NULL REFERENCES usuarios(id),
    bodega_id     BIGINT NOT NULL REFERENCES bodegas(id),
    fecha_inicio  DATE NOT NULL,
    fecha_fin     DATE NOT NULL,
    canon_mensual NUMERIC(12,2) NOT NULL,
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    url_documento TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contratos_fechas_check CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE IF NOT EXISTS movimientos (
    id               BIGSERIAL PRIMARY KEY,
    tipo             VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    objeto_id        BIGINT NOT NULL REFERENCES objetos(id),
    bodega_id        BIGINT NOT NULL REFERENCES bodegas(id),
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    observaciones    TEXT,
    registrado_por   UUID REFERENCES usuarios(id),
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accesos_personas (
    id             BIGSERIAL PRIMARY KEY,
    nombre_persona VARCHAR(255) NOT NULL,
    identificacion VARCHAR(50) NOT NULL,
    bodega_id      BIGINT NOT NULL REFERENCES bodegas(id),
    hora_entrada   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hora_salida    TIMESTAMPTZ,
    observaciones  TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  UUID REFERENCES usuarios(id),
    accion      VARCHAR(50) NOT NULL,
    tabla       VARCHAR(100) NOT NULL,
    registro_id TEXT,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen   VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_objetos_bodega     ON objetos(bodega_id);
CREATE INDEX IF NOT EXISTS idx_objetos_usuario    ON objetos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_objetos_zona       ON objetos(zona_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_bodega ON movimientos(bodega_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha  ON movimientos(fecha_movimiento DESC);
CREATE INDEX IF NOT EXISTS idx_contratos_usuario  ON contratos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contratos_activo   ON contratos(activo);
CREATE INDEX IF NOT EXISTS idx_zonas_bodega       ON zonas(bodega_id);
CREATE INDEX IF NOT EXISTS idx_accesos_bodega     ON accesos_personas(bodega_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario  ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha   ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla   ON audit_logs(tabla);

-- ============================================================
-- 3. FUNCIONES Y TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_actualizar_volumen_bodega()
RETURNS TRIGGER AS $$
DECLARE
    bodega_id_var BIGINT;
    nuevo_volumen NUMERIC(10,3);
BEGIN
    IF TG_OP = 'INSERT' THEN bodega_id_var := NEW.bodega_id;
    ELSIF TG_OP = 'UPDATE' THEN bodega_id_var := NEW.bodega_id;
    ELSIF TG_OP = 'DELETE' THEN bodega_id_var := OLD.bodega_id;
    END IF;
    SELECT COALESCE(SUM(COALESCE(largo_cm, 0) * COALESCE(ancho_cm, 0) * COALESCE(alto_cm, 0) * cantidad / 1000000), 0) INTO nuevo_volumen
    FROM objetos WHERE bodega_id = bodega_id_var;
    UPDATE bodegas SET volumen_ocupado_m3 = nuevo_volumen, updated_at = NOW() WHERE id = bodega_id_var;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_objetos_after AFTER INSERT OR UPDATE OR DELETE ON objetos FOR EACH ROW EXECUTE FUNCTION fn_actualizar_volumen_bodega();

CREATE OR REPLACE FUNCTION fn_actualizar_volumen_zona()
RETURNS TRIGGER AS $$
DECLARE
    zona_id_var BIGINT;
    nuevo_volumen NUMERIC(10,3);
BEGIN
    IF TG_OP = 'INSERT' THEN zona_id_var := NEW.zona_id;
    ELSIF TG_OP = 'UPDATE' THEN zona_id_var := NEW.zona_id;
    ELSIF TG_OP = 'DELETE' THEN zona_id_var := OLD.zona_id;
    END IF;
    IF zona_id_var IS NOT NULL THEN
        SELECT COALESCE(SUM(COALESCE(largo_cm, 0) * COALESCE(ancho_cm, 0) * COALESCE(alto_cm, 0) * cantidad / 1000000), 0) INTO nuevo_volumen
        FROM objetos WHERE zona_id = zona_id_var;
        UPDATE zonas SET volumen_ocupado_m3 = nuevo_volumen WHERE id = zona_id_var;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_objetos_zona_after AFTER INSERT OR UPDATE OR DELETE ON objetos FOR EACH ROW EXECUTE FUNCTION fn_actualizar_volumen_zona();

CREATE OR REPLACE FUNCTION fn_actualizar_estado_bodega()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activo = TRUE THEN
        UPDATE bodegas SET estado = 'EN_USO', updated_at = NOW() WHERE id = NEW.bodega_id AND estado = 'LIBRE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contratos_after AFTER INSERT OR UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_bodega();

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    registro_id_var TEXT;
BEGIN
    registro_id_var := COALESCE(NEW.id::TEXT, OLD.id::TEXT);
    INSERT INTO audit_logs (accion, tabla, registro_id, datos_anteriores, datos_nuevos)
    VALUES (TG_OP, TG_TABLE_NAME, registro_id_var, to_jsonb(OLD), to_jsonb(NEW));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_bodegas AFTER INSERT OR UPDATE OR DELETE ON bodegas FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_zonas AFTER INSERT OR UPDATE OR DELETE ON zonas FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_objetos AFTER INSERT OR UPDATE OR DELETE ON objetos FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_contratos AFTER INSERT OR UPDATE OR DELETE ON contratos FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_movimientos AFTER INSERT OR UPDATE OR DELETE ON movimientos FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_accesos AFTER INSERT OR UPDATE OR DELETE ON accesos_personas FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================
-- 4. RLS Y POLÍTICAS
-- ============================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE accesos_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role')::VARCHAR,
        (SELECT rol FROM public.usuarios WHERE id = auth.uid()),
        'USUARIO'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE POLICY "Admin puede ver todos los usuarios" ON usuarios FOR SELECT TO authenticated USING (public.get_my_role() = 'ADMIN' OR id = auth.uid());
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Cualquier usuario autenticado puede ver bodegas" ON bodegas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo Admin puede gestionar bodegas" ON bodegas FOR ALL TO authenticated USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Cualquier usuario autenticado puede ver zonas" ON zonas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo Admin puede gestionar zonas" ON zonas FOR ALL TO authenticated USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Usuarios pueden ver categorias" ON categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden crear categorias propias" ON categorias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios ven objetos propios o de sus bodegas" ON objetos FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR public.get_my_role() IN ('ADMIN', 'SEGURIDAD'));
CREATE POLICY "Usuarios pueden crear objetos propios" ON objetos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar objetos propios" ON objetos FOR UPDATE TO authenticated USING (usuario_id = auth.uid() OR public.get_my_role() = 'ADMIN');
CREATE POLICY "Usuarios pueden eliminar objetos propios" ON objetos FOR DELETE TO authenticated USING (usuario_id = auth.uid() OR public.get_my_role() = 'ADMIN');
CREATE POLICY "Admin ve contratos, usuarios ven los suyos" ON contratos FOR SELECT TO authenticated USING (usuario_id = auth.uid() OR public.get_my_role() = 'ADMIN');
CREATE POLICY "Solo Admin gestiona contratos" ON contratos FOR INSERT TO authenticated WITH CHECK (public.get_my_role() = 'ADMIN');
CREATE POLICY "Solo Admin actualiza contratos" ON contratos FOR UPDATE TO authenticated USING (public.get_my_role() = 'ADMIN');
CREATE POLICY "Usuarios ven movimientos de sus bodegas" ON movimientos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios pueden registrar movimientos" ON movimientos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Seguridad y Admin ven accesos" ON accesos_personas FOR SELECT TO authenticated USING (public.get_my_role() IN ('ADMIN', 'SEGURIDAD') OR bodega_id IN (SELECT b.id FROM bodegas b JOIN contratos c ON c.bodega_id = b.id WHERE c.usuario_id = auth.uid() AND c.activo = true));
CREATE POLICY "Seguridad y Admin registran accesos" ON accesos_personas FOR INSERT TO authenticated WITH CHECK (public.get_my_role() IN ('ADMIN', 'SEGURIDAD'));
CREATE POLICY "Solo Seguridad y Admin registran salidas" ON accesos_personas FOR UPDATE TO authenticated USING (public.get_my_role() IN ('ADMIN', 'SEGURIDAD'));
CREATE POLICY "Solo Admin ve logs de auditoría" ON audit_logs FOR SELECT TO authenticated USING (public.get_my_role() = 'ADMIN');