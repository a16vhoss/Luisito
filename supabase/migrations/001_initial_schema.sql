-- ============================================================
-- Mármol Calibe – Initial Schema Migration
-- ============================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'director', 'admin', 'rrhh', 'jefe_taller', 'residente', 'chofer', 'marmolero'
);

CREATE TYPE obra_estatus AS ENUM (
  'activa', 'pausada', 'completada', 'cancelada'
);

CREATE TYPE pieza_estatus AS ENUM (
  'fabricada', 'enviada', 'recibida', 'instalada', 'verificada', 'pendiente_detalle'
);

CREATE TYPE material_tipo AS ENUM (
  'lamina', 'insumo', 'herramienta', 'combustible'
);

CREATE TYPE lamina_estado AS ENUM (
  'disponible', 'en_corte', 'agotada'
);

CREATE TYPE mov_tipo AS ENUM (
  'entrada', 'salida'
);

CREATE TYPE remision_estatus AS ENUM (
  'creada', 'en_transito', 'entregada'
);

CREATE TYPE oc_estatus AS ENUM (
  'pendiente', 'aprobada', 'recibida', 'cancelada'
);

CREATE TYPE foto_tipo AS ENUM (
  'carga', 'entrega', 'instalacion', 'verificacion', 'dano'
);

CREATE TYPE asistencia_tipo AS ENUM (
  'normal', 'retardo', 'falta', 'permiso'
);

CREATE TYPE estimacion_estatus AS ENUM (
  'borrador', 'enviada', 'cobrada'
);

CREATE TYPE notif_tipo AS ENUM (
  'asistencia', 'remision', 'entrega', 'instalacion', 'compra', 'alerta', 'general'
);

-- ============================================================
-- 2. TABLES
-- ============================================================

-- 2.1 users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  telefono    TEXT,
  role        user_role NOT NULL DEFAULT 'marmolero',
  activo      BOOLEAN NOT NULL DEFAULT true,
  foto_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role    ON users (role);
CREATE INDEX idx_users_activo  ON users (activo);
CREATE INDEX idx_users_email   ON users (email);

-- 2.2 obras
CREATE TABLE obras (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                TEXT NOT NULL,
  cliente               TEXT NOT NULL,
  ubicacion             TEXT,
  contrato_total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  anticipo_porcentaje   NUMERIC(5,2) NOT NULL DEFAULT 0,
  anticipo_recibido     NUMERIC(14,2) NOT NULL DEFAULT 0,
  retencion_porcentaje  NUMERIC(5,2) NOT NULL DEFAULT 0,
  residente_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  estatus               obra_estatus NOT NULL DEFAULT 'activa',
  fecha_inicio          DATE,
  fecha_fin_estimada    DATE,
  notas                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_obras_estatus     ON obras (estatus);
CREATE INDEX idx_obras_residente   ON obras (residente_id);

-- 2.3 conceptos_obra
CREATE TABLE conceptos_obra (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id             UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  tipo_pieza          TEXT NOT NULL,
  descripcion         TEXT,
  medida_largo        NUMERIC(10,2) NOT NULL,
  medida_ancho        NUMERIC(10,2) NOT NULL,
  medida_espesor      NUMERIC(10,2),
  material_tipo       TEXT NOT NULL,
  cantidad_vendida    INT NOT NULL DEFAULT 0,
  cantidad_enviada    INT NOT NULL DEFAULT 0,
  cantidad_instalada  INT NOT NULL DEFAULT 0,
  cantidad_verificada INT NOT NULL DEFAULT 0,
  precio_unitario     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conceptos_obra_id ON conceptos_obra (obra_id);

-- 2.4 piezas
CREATE TABLE piezas (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concepto_id         UUID NOT NULL REFERENCES conceptos_obra(id) ON DELETE CASCADE,
  remision_id         UUID,
  estatus             pieza_estatus NOT NULL DEFAULT 'fabricada',
  notas               TEXT,
  instalado_por       UUID REFERENCES users(id) ON DELETE SET NULL,
  verificado_por      UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_envio         TIMESTAMPTZ,
  fecha_recepcion     TIMESTAMPTZ,
  fecha_instalacion   TIMESTAMPTZ,
  fecha_verificacion  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_piezas_concepto  ON piezas (concepto_id);
CREATE INDEX idx_piezas_estatus   ON piezas (estatus);
CREATE INDEX idx_piezas_remision  ON piezas (remision_id);

-- 2.5 materiales
CREATE TABLE materiales (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo              material_tipo NOT NULL,
  nombre            TEXT NOT NULL,
  unidad_medida     TEXT NOT NULL DEFAULT 'pieza',
  stock_actual      NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_minimo      NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_referencia NUMERIC(12,2),
  activo            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_materiales_tipo   ON materiales (tipo);
CREATE INDEX idx_materiales_activo ON materiales (activo);

-- 2.6 laminas
CREATE TABLE laminas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id   UUID NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
  tipo_piedra   TEXT NOT NULL,
  largo_cm      NUMERIC(8,2) NOT NULL,
  ancho_cm      NUMERIC(8,2) NOT NULL,
  espesor_cm    NUMERIC(8,2) NOT NULL DEFAULT 2,
  es_irregular  BOOLEAN NOT NULL DEFAULT false,
  proveedor     TEXT,
  lote          TEXT,
  estado        lamina_estado NOT NULL DEFAULT 'disponible',
  foto_url      TEXT,
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_laminas_estado     ON laminas (estado);
CREATE INDEX idx_laminas_material   ON laminas (material_id);

-- 2.7 movimientos_almacen
CREATE TABLE movimientos_almacen (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id     UUID NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,
  tipo            mov_tipo NOT NULL,
  cantidad        NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
  obra_destino_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  remision_id     UUID,
  orden_compra_id UUID,
  responsable_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mov_material   ON movimientos_almacen (material_id);
CREATE INDEX idx_mov_tipo       ON movimientos_almacen (tipo);
CREATE INDEX idx_mov_created    ON movimientos_almacen (created_at);
CREATE INDEX idx_mov_obra       ON movimientos_almacen (obra_destino_id);

-- 2.8 remisiones
CREATE TABLE remisiones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio       TEXT UNIQUE NOT NULL,
  obra_id     UUID NOT NULL REFERENCES obras(id) ON DELETE RESTRICT,
  chofer_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  creado_por  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  estatus     remision_estatus NOT NULL DEFAULT 'creada',
  pdf_url     TEXT,
  notas       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_remisiones_obra    ON remisiones (obra_id);
CREATE INDEX idx_remisiones_estatus ON remisiones (estatus);
CREATE INDEX idx_remisiones_folio   ON remisiones (folio);

-- 2.9 remision_items
CREATE TABLE remision_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remision_id UUID NOT NULL REFERENCES remisiones(id) ON DELETE CASCADE,
  concepto_id UUID NOT NULL REFERENCES conceptos_obra(id) ON DELETE RESTRICT,
  cantidad    INT NOT NULL CHECK (cantidad > 0),
  descripcion TEXT
);

CREATE INDEX idx_remision_items_remision ON remision_items (remision_id);

-- 2.10 ordenes_compra
CREATE TABLE ordenes_compra (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio       TEXT UNIQUE NOT NULL,
  proveedor   TEXT NOT NULL,
  estatus     oc_estatus NOT NULL DEFAULT 'pendiente',
  total       NUMERIC(14,2) NOT NULL DEFAULT 0,
  creado_por  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  aprobado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  notas       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_oc_estatus ON ordenes_compra (estatus);
CREATE INDEX idx_oc_folio   ON ordenes_compra (folio);

-- 2.11 orden_compra_items
CREATE TABLE orden_compra_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orden_id        UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  material_id     UUID NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,
  cantidad        NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_oci_orden ON orden_compra_items (orden_id);

-- 2.12 vehiculos
CREATE TABLE vehiculos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo                TEXT NOT NULL,
  marca               TEXT,
  modelo              TEXT,
  placas              TEXT,
  chofer_asignado_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  activo              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehiculos_chofer ON vehiculos (chofer_asignado_id);

-- 2.13 gastos_gasolina
CREATE TABLE gastos_gasolina (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chofer_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vehiculo_id     UUID REFERENCES vehiculos(id) ON DELETE SET NULL,
  monto           NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  litros          NUMERIC(8,2),
  tarjeta_id      TEXT,
  foto_ticket_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gastos_chofer ON gastos_gasolina (chofer_id);

-- 2.14 ubicaciones_chofer
CREATE TABLE ubicaciones_chofer (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chofer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitud       DOUBLE PRECISION NOT NULL,
  longitud      DOUBLE PRECISION NOT NULL,
  velocidad_kmh DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ubicaciones_chofer    ON ubicaciones_chofer (chofer_id);
CREATE INDEX idx_ubicaciones_created   ON ubicaciones_chofer (created_at);

-- 2.15 fotos
CREATE TABLE fotos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id     UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  pieza_id    UUID REFERENCES piezas(id) ON DELETE SET NULL,
  remision_id UUID REFERENCES remisiones(id) ON DELETE SET NULL,
  tipo        foto_tipo NOT NULL,
  url         TEXT NOT NULL,
  notas       TEXT,
  subido_por  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fotos_obra     ON fotos (obra_id);
CREATE INDEX idx_fotos_tipo     ON fotos (tipo);
CREATE INDEX idx_fotos_pieza    ON fotos (pieza_id);

-- 2.16 asistencia
CREATE TABLE asistencia (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  hora_entrada    TIME,
  hora_salida     TIME,
  tipo            asistencia_tipo NOT NULL DEFAULT 'normal',
  obra_asignada_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  registrado_en   TEXT NOT NULL DEFAULT 'planta' CHECK (registrado_en IN ('planta', 'obra')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, fecha)
);

CREATE INDEX idx_asistencia_usuario ON asistencia (usuario_id);
CREATE INDEX idx_asistencia_fecha   ON asistencia (fecha);
CREATE INDEX idx_asistencia_tipo    ON asistencia (tipo);

-- 2.17 finanzas_obra
CREATE TABLE finanzas_obra (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id             UUID UNIQUE NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  contrato_total      NUMERIC(14,2) NOT NULL DEFAULT 0,
  anticipo_recibido   NUMERIC(14,2) NOT NULL DEFAULT 0,
  estimado_acumulado  NUMERIC(14,2) NOT NULL DEFAULT 0,
  retenido_acumulado  NUMERIC(14,2) NOT NULL DEFAULT 0,
  cobrado_acumulado   NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.18 estimaciones
CREATE TABLE estimaciones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id         UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero          INT NOT NULL,
  monto_bruto     NUMERIC(14,2) NOT NULL DEFAULT 0,
  retenciones     NUMERIC(14,2) NOT NULL DEFAULT 0,
  monto_neto      NUMERIC(14,2) NOT NULL DEFAULT 0,
  piezas_incluidas TEXT,
  estatus         estimacion_estatus NOT NULL DEFAULT 'borrador',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (obra_id, numero)
);

CREATE INDEX idx_estimaciones_obra ON estimaciones (obra_id);

-- 2.19 desperdicios
CREATE TABLE desperdicios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_material   TEXT NOT NULL,
  largo_cm        NUMERIC(8,2) NOT NULL,
  ancho_cm        NUMERIC(8,2) NOT NULL,
  espesor_cm      NUMERIC(8,2) NOT NULL DEFAULT 2,
  es_irregular    BOOLEAN NOT NULL DEFAULT false,
  calidad         TEXT NOT NULL DEFAULT 'buena' CHECK (calidad IN ('buena', 'regular', 'solo_piezas_pequenas')),
  ubicacion_planta TEXT,
  foto_url        TEXT,
  disponible      BOOLEAN NOT NULL DEFAULT true,
  usado_en_pieza_id UUID REFERENCES piezas(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_desperdicios_disponible ON desperdicios (disponible);

-- 2.20 notificaciones
CREATE TABLE notificaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo        notif_tipo NOT NULL,
  titulo      TEXT NOT NULL,
  mensaje     TEXT NOT NULL,
  obra_id     UUID REFERENCES obras(id) ON DELETE SET NULL,
  leida       BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user    ON notificaciones (user_id);
CREATE INDEX idx_notif_leida   ON notificaciones (leida);
CREATE INDEX idx_notif_created ON notificaciones (created_at);

-- 2.21 audit_log
CREATE TABLE audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla           TEXT NOT NULL,
  registro_id     UUID NOT NULL,
  accion          TEXT NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores JSONB,
  datos_nuevos    JSONB,
  usuario_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_tabla     ON audit_log (tabla);
CREATE INDEX idx_audit_registro  ON audit_log (registro_id);
CREATE INDEX idx_audit_usuario   ON audit_log (usuario_id);
CREATE INDEX idx_audit_created   ON audit_log (created_at);

-- ============================================================
-- 3. Add FK from piezas.remision_id → remisiones (deferred)
-- ============================================================
ALTER TABLE piezas
  ADD CONSTRAINT fk_piezas_remision
  FOREIGN KEY (remision_id) REFERENCES remisiones(id) ON DELETE SET NULL;

-- Add FK from movimientos_almacen.remision_id → remisiones
ALTER TABLE movimientos_almacen
  ADD CONSTRAINT fk_mov_remision
  FOREIGN KEY (remision_id) REFERENCES remisiones(id) ON DELETE SET NULL;

-- Add FK from movimientos_almacen.orden_compra_id → ordenes_compra
ALTER TABLE movimientos_almacen
  ADD CONSTRAINT fk_mov_orden_compra
  FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON DELETE SET NULL;

-- ============================================================
-- 4. TRIGGERS: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON obras
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON finanzas_obra
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 5. TRIGGERS: Auto-generate folio for remisiones (REM-YYYY-XXXXX)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_remision_folio()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num  INT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(folio FROM 10 FOR 5) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM remisiones
  WHERE folio LIKE 'REM-' || year_str || '-%';

  NEW.folio := 'REM-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_remision_folio
  BEFORE INSERT ON remisiones
  FOR EACH ROW
  WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION generate_remision_folio();

-- ============================================================
-- 6. TRIGGERS: Auto-generate folio for ordenes_compra (OC-YYYY-XXXXX)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_oc_folio()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num  INT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(folio FROM 9 FOR 5) AS INT)
  ), 0) + 1
  INTO seq_num
  FROM ordenes_compra
  WHERE folio LIKE 'OC-' || year_str || '-%';

  NEW.folio := 'OC-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_oc_folio
  BEFORE INSERT ON ordenes_compra
  FOR EACH ROW
  WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION generate_oc_folio();

-- ============================================================
-- 7. ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras                ENABLE ROW LEVEL SECURITY;
ALTER TABLE conceptos_obra       ENABLE ROW LEVEL SECURITY;
ALTER TABLE piezas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales           ENABLE ROW LEVEL SECURITY;
ALTER TABLE laminas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_almacen  ENABLE ROW LEVEL SECURITY;
ALTER TABLE remisiones           ENABLE ROW LEVEL SECURITY;
ALTER TABLE remision_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_compra_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_gasolina      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones_chofer   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia           ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas_obra        ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimaciones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE desperdicios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------- users ----------
-- Directors and admins: full access
CREATE POLICY "directors_admins_full_users" ON users
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'rrhh'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'rrhh'));

-- All authenticated users can read their own row
CREATE POLICY "users_read_self" ON users
  FOR SELECT
  USING (id = auth.uid());

-- ---------- obras ----------
CREATE POLICY "directors_admins_full_obras" ON obras
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- Residentes can read their assigned obras
CREATE POLICY "residente_read_obras" ON obras
  FOR SELECT
  USING (
    auth_user_role() = 'residente'
    AND residente_id = auth.uid()
  );

-- Jefe taller, chofer, marmolero can read all obras
CREATE POLICY "staff_read_obras" ON obras
  FOR SELECT
  USING (auth_user_role() IN ('jefe_taller', 'chofer', 'marmolero', 'rrhh'));

-- ---------- conceptos_obra ----------
CREATE POLICY "all_read_conceptos" ON conceptos_obra
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_conceptos" ON conceptos_obra
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- piezas ----------
CREATE POLICY "all_read_piezas" ON piezas
  FOR SELECT
  USING (true);

CREATE POLICY "staff_manage_piezas" ON piezas
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller', 'residente'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller', 'residente'));

-- ---------- materiales ----------
CREATE POLICY "all_read_materiales" ON materiales
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_materiales" ON materiales
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- laminas ----------
CREATE POLICY "all_read_laminas" ON laminas
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_laminas" ON laminas
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- movimientos_almacen ----------
CREATE POLICY "all_read_movimientos" ON movimientos_almacen
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_movimientos" ON movimientos_almacen
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- remisiones ----------
CREATE POLICY "all_read_remisiones" ON remisiones
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_remisiones" ON remisiones
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- remision_items ----------
CREATE POLICY "all_read_remision_items" ON remision_items
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_remision_items" ON remision_items
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- ordenes_compra ----------
CREATE POLICY "all_read_oc" ON ordenes_compra
  FOR SELECT
  USING (auth_user_role() IN ('director', 'admin'));

CREATE POLICY "admin_manage_oc" ON ordenes_compra
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- orden_compra_items ----------
CREATE POLICY "all_read_oci" ON orden_compra_items
  FOR SELECT
  USING (auth_user_role() IN ('director', 'admin'));

CREATE POLICY "admin_manage_oci" ON orden_compra_items
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- vehiculos ----------
CREATE POLICY "all_read_vehiculos" ON vehiculos
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_vehiculos" ON vehiculos
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- gastos_gasolina ----------
CREATE POLICY "chofer_read_own_gastos" ON gastos_gasolina
  FOR SELECT
  USING (chofer_id = auth.uid() OR auth_user_role() IN ('director', 'admin'));

CREATE POLICY "chofer_insert_gastos" ON gastos_gasolina
  FOR INSERT
  WITH CHECK (chofer_id = auth.uid() OR auth_user_role() IN ('director', 'admin'));

-- ---------- ubicaciones_chofer ----------
CREATE POLICY "chofer_own_ubicaciones" ON ubicaciones_chofer
  FOR ALL
  USING (chofer_id = auth.uid() OR auth_user_role() IN ('director', 'admin'))
  WITH CHECK (chofer_id = auth.uid());

-- ---------- fotos ----------
CREATE POLICY "all_read_fotos" ON fotos
  FOR SELECT
  USING (true);

CREATE POLICY "staff_insert_fotos" ON fotos
  FOR INSERT
  WITH CHECK (subido_por = auth.uid());

-- ---------- asistencia ----------
CREATE POLICY "rrhh_full_asistencia" ON asistencia
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'rrhh'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'rrhh'));

CREATE POLICY "user_read_own_asistencia" ON asistencia
  FOR SELECT
  USING (usuario_id = auth.uid());

-- ---------- finanzas_obra ----------
CREATE POLICY "director_admin_finanzas" ON finanzas_obra
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- estimaciones ----------
CREATE POLICY "director_admin_estimaciones" ON estimaciones
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin'))
  WITH CHECK (auth_user_role() IN ('director', 'admin'));

-- ---------- desperdicios ----------
CREATE POLICY "all_read_desperdicios" ON desperdicios
  FOR SELECT
  USING (true);

CREATE POLICY "staff_manage_desperdicios" ON desperdicios
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- notificaciones ----------
CREATE POLICY "user_own_notificaciones" ON notificaciones
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_send_notificaciones" ON notificaciones
  FOR INSERT
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'rrhh'));

-- ---------- audit_log ----------
CREATE POLICY "director_admin_audit" ON audit_log
  FOR SELECT
  USING (auth_user_role() IN ('director', 'admin'));

CREATE POLICY "system_insert_audit" ON audit_log
  FOR INSERT
  WITH CHECK (true);
