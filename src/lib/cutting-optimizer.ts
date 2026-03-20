/**
 * Optimizador de Corte 2D — Empaquetado rectangular con cortes de guillotina
 *
 * Algoritmo diseñado para la industria del mármol donde todos los cortes
 * deben ser rectos (guillotina). Utiliza una estrategia de "best area fit"
 * con soporte para rotación de piezas.
 *
 * Flujo:
 *  1. Expandir piezas según su cantidad
 *  2. Ordenar piezas de mayor a menor área
 *  3. Ordenar fuentes: sobrantes primero, luego láminas
 *  4. Para cada fuente, empaquetar piezas usando guillotine bin packing
 *  5. Registrar sobrantes útiles resultantes
 *  6. Generar resumen de aprovechamiento
 */

// ============================================================
// TIPOS DE ENTRADA
// ============================================================

/** Pieza que se necesita cortar */
export interface PiezaRequerida {
  id: string;
  label: string;
  concepto_id?: string;
  largo: number;  // cm
  ancho: number;  // cm
  cantidad: number;
}

/** Fuente de material disponible (lámina completa o sobrante reutilizable) */
export interface FuenteDisponible {
  id: string;
  tipo: 'lamina' | 'sobrante';
  largo: number;  // cm
  ancho: number;  // cm
  material: string;
  // Los sobrantes tienen prioridad (se usan primero)
}

/** Configuración del optimizador */
export interface OptimizerConfig {
  /** Ancho de la lámina de corte (sierra) en cm. Default: 0.5 */
  margenCorte: number;
  /** Tamaño mínimo del lado más corto de un sobrante para considerarlo útil, en cm. Default: 10 */
  minimoSobranteUtil: number;
}

// ============================================================
// TIPOS DE SALIDA
// ============================================================

/** Pieza colocada en una fuente con su posición y orientación */
export interface PlacedPiece {
  pieza: PiezaRequerida;
  x: number;
  y: number;
  largo: number;  // dimensión real colocada (puede estar rotada)
  ancho: number;
  rotada: boolean;
}

/** Sobrante resultante aprovechable */
export interface PlannedRemnant {
  x: number;
  y: number;
  largo: number;
  ancho: number;
}

/** Plan de corte para una fuente individual */
export interface PlannedSource {
  fuente: FuenteDisponible;
  piezasColocadas: PlacedPiece[];
  sobrantesResultantes: PlannedRemnant[];
  areaUsada: number;
  areaTotal: number;
  porcentajeUso: number;
}

/** Resultado completo del plan de corte */
export interface CuttingPlan {
  fuentes: PlannedSource[];
  piezasSinAsignar: PiezaRequerida[];
  resumen: {
    totalPiezas: number;
    totalFuentes: number;
    sobrantesUsados: number;
    laminasUsadas: number;
    sobrantesGenerados: number;
    areaTotal: number;
    areaPiezas: number;
    areaDesperdicio: number;
    porcentajeAprovechamiento: number;
  };
}

// ============================================================
// TIPOS INTERNOS
// ============================================================

/**
 * Rectángulo libre dentro de una fuente donde se pueden colocar piezas.
 * El algoritmo de guillotina mantiene una lista de estos espacios.
 */
interface RectanguloLibre {
  x: number;
  y: number;
  largo: number;  // dimensión horizontal
  ancho: number;  // dimensión vertical
}

/**
 * Resultado de intentar colocar una pieza en un rectángulo libre.
 * Incluye la puntuación para comparar opciones.
 */
interface ColocacionCandidata {
  rectIndex: number;
  rotada: boolean;
  /** Área sobrante en el rectángulo después de colocar la pieza (menor = mejor ajuste) */
  areaResidual: number;
  /** Dimensiones efectivas de la pieza en esta colocación */
  largoEfectivo: number;
  anchoEfectivo: number;
}

// ============================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================

const CONFIG_DEFAULT: OptimizerConfig = {
  margenCorte: 0.5,
  minimoSobranteUtil: 10,
};

// ============================================================
// ALGORITMO PRINCIPAL
// ============================================================

/**
 * Función principal del optimizador de corte.
 *
 * Recibe las piezas requeridas, las fuentes de material disponibles y
 * una configuración opcional. Devuelve un plan de corte completo.
 */
export function optimizarCorte(
  piezas: PiezaRequerida[],
  fuentes: FuenteDisponible[],
  config?: Partial<OptimizerConfig>,
): CuttingPlan {
  const cfg: OptimizerConfig = { ...CONFIG_DEFAULT, ...config };

  // --- Paso 1: Expandir piezas por cantidad ---
  // Cada unidad de una pieza se convierte en una entrada individual
  const piezasExpandidas = expandirPiezas(piezas);

  // --- Paso 2: Ordenar piezas de mayor a menor área ---
  piezasExpandidas.sort((a, b) => (b.largo * b.ancho) - (a.largo * a.ancho));

  // --- Paso 3: Ordenar fuentes (sobrantes primero, luego láminas) ---
  // Dentro de cada grupo, las más pequeñas primero para minimizar desperdicio
  const fuentesOrdenadas = [...fuentes].sort((a, b) => {
    if (a.tipo !== b.tipo) {
      return a.tipo === 'sobrante' ? -1 : 1;
    }
    // Dentro del mismo tipo, las más pequeñas primero (best fit)
    return (a.largo * a.ancho) - (b.largo * b.ancho);
  });

  // --- Paso 4: Empaquetar piezas en fuentes ---
  const resultado: PlannedSource[] = [];
  let piezasPendientes = [...piezasExpandidas];

  for (const fuente of fuentesOrdenadas) {
    if (piezasPendientes.length === 0) break;

    const planFuente = empaquetarEnFuente(fuente, piezasPendientes, cfg);

    // Solo incluir la fuente si se colocó al menos una pieza
    if (planFuente.piezasColocadas.length > 0) {
      resultado.push(planFuente);

      // Remover piezas ya colocadas del listado pendiente
      const idsColocados = new Set(
        planFuente.piezasColocadas.map((pp) => pp.pieza.id),
      );
      piezasPendientes = piezasPendientes.filter((p) => !idsColocados.has(p.id));
    }
  }

  // --- Paso 5: Generar resumen ---
  return generarPlanCompleto(resultado, piezasPendientes, piezasExpandidas);
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Expande las piezas según su cantidad.
 * Una pieza con cantidad=3 se convierte en 3 piezas individuales,
 * cada una con un ID único derivado del original.
 */
function expandirPiezas(piezas: PiezaRequerida[]): PiezaRequerida[] {
  const expandidas: PiezaRequerida[] = [];

  for (const pieza of piezas) {
    for (let i = 0; i < pieza.cantidad; i++) {
      expandidas.push({
        ...pieza,
        id: pieza.cantidad > 1 ? `${pieza.id}_${i + 1}` : pieza.id,
        cantidad: 1,
      });
    }
  }

  return expandidas;
}

/**
 * Empaqueta tantas piezas como sea posible en una fuente dada,
 * usando el algoritmo de corte de guillotina.
 *
 * El corte de guillotina divide un rectángulo libre en dos sub-rectángulos
 * mediante un corte recto (horizontal o vertical) de lado a lado.
 * Esto refleja cómo se corta mármol en la realidad.
 */
function empaquetarEnFuente(
  fuente: FuenteDisponible,
  piezas: PiezaRequerida[],
  cfg: OptimizerConfig,
): PlannedSource {
  // Iniciar con un único rectángulo libre que abarca toda la fuente
  let rectangulosLibres: RectanguloLibre[] = [
    { x: 0, y: 0, largo: fuente.largo, ancho: fuente.ancho },
  ];

  const piezasColocadas: PlacedPiece[] = [];
  const piezasRestantes = [...piezas];

  // Intentar colocar cada pieza (ya ordenadas por área descendente)
  for (let i = 0; i < piezasRestantes.length; i++) {
    const pieza = piezasRestantes[i];
    const colocacion = encontrarMejorColocacion(pieza, rectangulosLibres, cfg);

    if (!colocacion) continue; // No cabe en ningún espacio libre

    const rect = rectangulosLibres[colocacion.rectIndex];

    // Registrar la pieza colocada
    piezasColocadas.push({
      pieza,
      x: rect.x,
      y: rect.y,
      largo: colocacion.largoEfectivo,
      ancho: colocacion.anchoEfectivo,
      rotada: colocacion.rotada,
    });

    // Dividir el rectángulo libre usando corte de guillotina
    const nuevosRectangulos = dividirGuillotina(
      rect,
      colocacion.largoEfectivo,
      colocacion.anchoEfectivo,
      cfg.margenCorte,
    );

    // Reemplazar el rectángulo usado con los nuevos sub-rectángulos
    rectangulosLibres.splice(colocacion.rectIndex, 1, ...nuevosRectangulos);

    // Limpiar rectángulos demasiado pequeños para cualquier uso
    rectangulosLibres = rectangulosLibres.filter(
      (r) => r.largo > cfg.margenCorte && r.ancho > cfg.margenCorte,
    );

    // Marcar pieza como colocada (se filtra después)
    piezasRestantes[i] = null as unknown as PiezaRequerida;
  }

  // Identificar sobrantes útiles
  const sobrantesResultantes = rectangulosLibres
    .filter((r) => Math.min(r.largo, r.ancho) >= cfg.minimoSobranteUtil)
    .map((r) => ({
      x: r.x,
      y: r.y,
      largo: redondear(r.largo),
      ancho: redondear(r.ancho),
    }));

  const areaTotal = fuente.largo * fuente.ancho;
  const areaUsada = piezasColocadas.reduce(
    (sum, pp) => sum + pp.largo * pp.ancho,
    0,
  );

  return {
    fuente,
    piezasColocadas,
    sobrantesResultantes,
    areaUsada: redondear(areaUsada),
    areaTotal: redondear(areaTotal),
    porcentajeUso: redondear((areaUsada / areaTotal) * 100),
  };
}

/**
 * Busca la mejor posición para colocar una pieza entre todos los
 * rectángulos libres disponibles.
 *
 * Estrategia "Best Area Fit": se elige el rectángulo libre cuya
 * área residual (después de colocar la pieza) sea la menor.
 * Esto minimiza el espacio desperdiciado.
 *
 * Se prueban ambas orientaciones (normal y rotada).
 */
function encontrarMejorColocacion(
  pieza: PiezaRequerida,
  rectangulosLibres: RectanguloLibre[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cfg: OptimizerConfig,
): ColocacionCandidata | null {
  let mejor: ColocacionCandidata | null = null;

  for (let i = 0; i < rectangulosLibres.length; i++) {
    const rect = rectangulosLibres[i];

    // Probar orientación normal
    if (cabeEnRectangulo(pieza.largo, pieza.ancho, rect)) {
      const candidata: ColocacionCandidata = {
        rectIndex: i,
        rotada: false,
        areaResidual: (rect.largo * rect.ancho) - (pieza.largo * pieza.ancho),
        largoEfectivo: pieza.largo,
        anchoEfectivo: pieza.ancho,
      };

      if (!mejor || candidata.areaResidual < mejor.areaResidual) {
        mejor = candidata;
      }
    }

    // Probar orientación rotada (solo si las dimensiones son distintas)
    if (pieza.largo !== pieza.ancho && cabeEnRectangulo(pieza.ancho, pieza.largo, rect)) {
      const candidata: ColocacionCandidata = {
        rectIndex: i,
        rotada: true,
        areaResidual: (rect.largo * rect.ancho) - (pieza.largo * pieza.ancho),
        largoEfectivo: pieza.ancho,
        anchoEfectivo: pieza.largo,
      };

      if (!mejor || candidata.areaResidual < mejor.areaResidual) {
        mejor = candidata;
      }
    }
  }

  return mejor;
}

/**
 * Verifica si una pieza con dimensiones dadas cabe dentro de un rectángulo libre.
 */
function cabeEnRectangulo(
  largo: number,
  ancho: number,
  rect: RectanguloLibre,
): boolean {
  return largo <= rect.largo && ancho <= rect.ancho;
}

/**
 * Divide un rectángulo libre después de colocar una pieza, generando
 * hasta dos nuevos rectángulos mediante un corte de guillotina.
 *
 * La pieza se coloca en la esquina superior-izquierda del rectángulo.
 * El corte de guillotina puede ser:
 *
 *   Horizontal (divide por el ancho de la pieza):
 *   ┌──────────┬─────────────┐
 *   │  PIEZA   │  Derecha    │
 *   │          │             │
 *   ├──────────┘             │
 *   │        Abajo           │
 *   └────────────────────────┘
 *
 *   Vertical (divide por el largo de la pieza):
 *   ┌──────────┬─────────────┐
 *   │  PIEZA   │             │
 *   │          │  Derecha    │
 *   ├──────────┤             │
 *   │  Abajo   │             │
 *   └──────────┴─────────────┘
 *
 * Se elige la variante que maximice el área del rectángulo más grande
 * resultante, favoreciendo espacios más útiles.
 */
function dividirGuillotina(
  rect: RectanguloLibre,
  piezaLargo: number,
  piezaAncho: number,
  margenCorte: number,
): RectanguloLibre[] {
  const resultado: RectanguloLibre[] = [];

  // Espacio restante después de la pieza + margen de corte
  const restoLargo = rect.largo - piezaLargo - margenCorte;
  const restoAncho = rect.ancho - piezaAncho - margenCorte;

  // Si no queda espacio significativo en ninguna dirección, no hay sub-rectángulos
  if (restoLargo <= 0 && restoAncho <= 0) {
    return resultado;
  }

  // Evaluar ambas variantes de corte para elegir la mejor
  // Variante horizontal: el corte horizontal extiende el rectángulo derecho hacia abajo
  const derechaH: RectanguloLibre = {
    x: rect.x + piezaLargo + margenCorte,
    y: rect.y,
    largo: Math.max(0, restoLargo),
    ancho: rect.ancho, // se extiende todo el ancho
  };
  const abajoH: RectanguloLibre = {
    x: rect.x,
    y: rect.y + piezaAncho + margenCorte,
    largo: piezaLargo, // solo el ancho de la pieza
    ancho: Math.max(0, restoAncho),
  };

  // Variante vertical: el corte vertical extiende el rectángulo inferior a la derecha
  const derechaV: RectanguloLibre = {
    x: rect.x + piezaLargo + margenCorte,
    y: rect.y,
    largo: Math.max(0, restoLargo),
    ancho: piezaAncho, // solo la altura de la pieza
  };
  const abajoV: RectanguloLibre = {
    x: rect.x,
    y: rect.y + piezaAncho + margenCorte,
    largo: rect.largo, // se extiende todo el largo
    ancho: Math.max(0, restoAncho),
  };

  // Elegir la variante que produzca el rectángulo más grande
  const maxAreaH = Math.max(
    derechaH.largo * derechaH.ancho,
    abajoH.largo * abajoH.ancho,
  );
  const maxAreaV = Math.max(
    derechaV.largo * derechaV.ancho,
    abajoV.largo * abajoV.ancho,
  );

  let derecha: RectanguloLibre;
  let abajo: RectanguloLibre;

  if (maxAreaH >= maxAreaV) {
    derecha = derechaH;
    abajo = abajoH;
  } else {
    derecha = derechaV;
    abajo = abajoV;
  }

  // Solo agregar rectángulos con área positiva
  if (derecha.largo > 0 && derecha.ancho > 0) {
    resultado.push(derecha);
  }
  if (abajo.largo > 0 && abajo.ancho > 0) {
    resultado.push(abajo);
  }

  return resultado;
}

/**
 * Genera el plan de corte completo con resumen estadístico.
 */
function generarPlanCompleto(
  fuentes: PlannedSource[],
  piezasSinAsignar: PiezaRequerida[],
  todasLasPiezas: PiezaRequerida[],
): CuttingPlan {
  const sobrantesUsados = fuentes.filter((f) => f.fuente.tipo === 'sobrante').length;
  const laminasUsadas = fuentes.filter((f) => f.fuente.tipo === 'lamina').length;
  const sobrantesGenerados = fuentes.reduce(
    (sum, f) => sum + f.sobrantesResultantes.length,
    0,
  );

  const areaTotal = fuentes.reduce((sum, f) => sum + f.areaTotal, 0);
  const areaPiezas = fuentes.reduce((sum, f) => sum + f.areaUsada, 0);
  const areaDesperdicio = areaTotal - areaPiezas;

  return {
    fuentes,
    piezasSinAsignar,
    resumen: {
      totalPiezas: todasLasPiezas.length - piezasSinAsignar.length,
      totalFuentes: fuentes.length,
      sobrantesUsados,
      laminasUsadas,
      sobrantesGenerados,
      areaTotal: redondear(areaTotal),
      areaPiezas: redondear(areaPiezas),
      areaDesperdicio: redondear(areaDesperdicio),
      porcentajeAprovechamiento: areaTotal > 0
        ? redondear((areaPiezas / areaTotal) * 100)
        : 0,
    },
  };
}

/**
 * Redondea un número a 2 decimales para evitar errores de punto flotante
 * en las dimensiones y áreas.
 */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
