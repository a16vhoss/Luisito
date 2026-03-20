-- ============================================================
-- Mármol Calibe – Cutting Plans Migration
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1.1 planes_corte: A cutting plan session
CREATE TABLE planes_corte (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id                   UUID REFERENCES obras(id) ON DELETE SET NULL,
  creado_por                UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  aprobado_por              UUID REFERENCES users(id) ON DELETE SET NULL,
  estatus                   TEXT NOT NULL DEFAULT 'borrador' CHECK (estatus IN ('borrador', 'aprobado', 'ejecutado', 'cancelado')),
  total_piezas              INT NOT NULL DEFAULT 0,
  total_laminas_usadas      INT NOT NULL DEFAULT 0,
  total_sobrantes_usados    INT NOT NULL DEFAULT 0,
  total_sobrantes_generados INT NOT NULL DEFAULT 0,
  porcentaje_aprovechamiento NUMERIC(5,2) NOT NULL DEFAULT 0,
  area_total_material       NUMERIC(12,2) NOT NULL DEFAULT 0,
  area_total_piezas         NUMERIC(12,2) NOT NULL DEFAULT 0,
  area_total_desperdicio    NUMERIC(12,2) NOT NULL DEFAULT 0,
  notas                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planes_corte_obra      ON planes_corte (obra_id);
CREATE INDEX idx_planes_corte_estatus   ON planes_corte (estatus);
CREATE INDEX idx_planes_corte_creado    ON planes_corte (creado_por);
CREATE INDEX idx_planes_corte_created   ON planes_corte (created_at);

-- 1.2 plan_corte_fuentes: each source material (lamina or sobrante) used in a plan
CREATE TABLE plan_corte_fuentes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id         UUID NOT NULL REFERENCES planes_corte(id) ON DELETE CASCADE,
  tipo_fuente     TEXT NOT NULL CHECK (tipo_fuente IN ('lamina', 'sobrante')),
  lamina_id       UUID REFERENCES laminas(id) ON DELETE SET NULL,
  desperdicio_id  UUID REFERENCES desperdicios(id) ON DELETE SET NULL,
  largo_cm        NUMERIC(8,2) NOT NULL,
  ancho_cm        NUMERIC(8,2) NOT NULL,
  area_total      NUMERIC(12,2) NOT NULL,
  area_usada      NUMERIC(12,2) NOT NULL DEFAULT 0,
  area_sobrante   NUMERIC(12,2) NOT NULL DEFAULT 0,
  porcentaje_uso  NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_pcf_plan        ON plan_corte_fuentes (plan_id);
CREATE INDEX idx_pcf_lamina      ON plan_corte_fuentes (lamina_id);
CREATE INDEX idx_pcf_desperdicio ON plan_corte_fuentes (desperdicio_id);

-- 1.3 plan_corte_piezas: each piece placement within a source
CREATE TABLE plan_corte_piezas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fuente_id     UUID NOT NULL REFERENCES plan_corte_fuentes(id) ON DELETE CASCADE,
  concepto_id   UUID REFERENCES conceptos_obra(id) ON DELETE SET NULL,
  label         TEXT NOT NULL,
  largo_cm      NUMERIC(8,2) NOT NULL,
  ancho_cm      NUMERIC(8,2) NOT NULL,
  pos_x         NUMERIC(8,2) NOT NULL DEFAULT 0,
  pos_y         NUMERIC(8,2) NOT NULL DEFAULT 0,
  rotada        BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_pcp_fuente   ON plan_corte_piezas (fuente_id);
CREATE INDEX idx_pcp_concepto ON plan_corte_piezas (concepto_id);

-- 1.4 plan_corte_sobrantes_generados: remnants that would be created from cutting
CREATE TABLE plan_corte_sobrantes_generados (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fuente_id               UUID NOT NULL REFERENCES plan_corte_fuentes(id) ON DELETE CASCADE,
  largo_cm                NUMERIC(8,2) NOT NULL,
  ancho_cm                NUMERIC(8,2) NOT NULL,
  pos_x                   NUMERIC(8,2) NOT NULL DEFAULT 0,
  pos_y                   NUMERIC(8,2) NOT NULL DEFAULT 0,
  desperdicio_generado_id UUID REFERENCES desperdicios(id) ON DELETE SET NULL
);

CREATE INDEX idx_pcsg_fuente      ON plan_corte_sobrantes_generados (fuente_id);
CREATE INDEX idx_pcsg_desperdicio ON plan_corte_sobrantes_generados (desperdicio_generado_id);

-- ============================================================
-- 2. TRIGGERS: updated_at for planes_corte
-- ============================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON planes_corte
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- 3. ENABLE RLS
-- ============================================================

ALTER TABLE planes_corte                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_corte_fuentes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_corte_piezas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_corte_sobrantes_generados ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- ---------- planes_corte ----------
CREATE POLICY "all_read_planes_corte" ON planes_corte
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_planes_corte" ON planes_corte
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- plan_corte_fuentes ----------
CREATE POLICY "all_read_plan_corte_fuentes" ON plan_corte_fuentes
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_plan_corte_fuentes" ON plan_corte_fuentes
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- plan_corte_piezas ----------
CREATE POLICY "all_read_plan_corte_piezas" ON plan_corte_piezas
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_plan_corte_piezas" ON plan_corte_piezas
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));

-- ---------- plan_corte_sobrantes_generados ----------
CREATE POLICY "all_read_plan_corte_sobrantes" ON plan_corte_sobrantes_generados
  FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_plan_corte_sobrantes" ON plan_corte_sobrantes_generados
  FOR ALL
  USING (auth_user_role() IN ('director', 'admin', 'jefe_taller'))
  WITH CHECK (auth_user_role() IN ('director', 'admin', 'jefe_taller'));
