-- Add traceability and notes to desperdicios
ALTER TABLE desperdicios ADD COLUMN lamina_id UUID REFERENCES laminas(id) ON DELETE SET NULL;
ALTER TABLE desperdicios ADD COLUMN notas TEXT;

-- Compound index for smart search queries
CREATE INDEX idx_desperdicios_search ON desperdicios (disponible, tipo_material, largo_cm, ancho_cm);
