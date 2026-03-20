'use client';

import React, { useMemo } from 'react';
import {
  Scissors,
  Layers,
  Recycle,
  PlusSquare,
  BarChart3,
  RulerIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============ TYPES ============

interface PiezaRect {
  id: string;
  label: string;
  x: number;
  y: number;
  largo: number;
  ancho: number;
  rotada: boolean;
}

interface SobranteRect {
  x: number;
  y: number;
  largo: number;
  ancho: number;
}

interface CuttingPlanViewerProps {
  fuente: {
    largo: number; // cm
    ancho: number; // cm
    tipo: 'lamina' | 'sobrante';
    label?: string;
  };
  piezas: PiezaRect[];
  sobrantes: SobranteRect[];
  porcentajeUso: number;
  compact?: boolean;
}

export interface CuttingPlanResumen {
  totalPiezas: number;
  laminasUsadas: number;
  sobrantesReutilizados: number;
  nuevosSobrantes: number;
  porcentajeAprovechamiento: number;
  areaTotalCm2: number;
  areaUsadaCm2: number;
  desperdicioCm2: number;
}

// ============ COLOR PALETTE ============

const PIECE_COLORS = [
  { fill: '#bfdbfe', stroke: '#3b82f6', text: '#1e40af' }, // blue-200
  { fill: '#bbf7d0', stroke: '#22c55e', text: '#166534' }, // green-200
  { fill: '#fde68a', stroke: '#f59e0b', text: '#92400e' }, // amber-200
  { fill: '#e9d5ff', stroke: '#a855f7', text: '#6b21a8' }, // purple-200
  { fill: '#fecaca', stroke: '#ef4444', text: '#991b1b' }, // red-200
  { fill: '#a5f3fc', stroke: '#06b6d4', text: '#155e75' }, // cyan-200
  { fill: '#fed7aa', stroke: '#f97316', text: '#9a3412' }, // orange-200
  { fill: '#fbcfe8', stroke: '#ec4899', text: '#9d174d' }, // pink-200
  { fill: '#d9f99d', stroke: '#84cc16', text: '#3f6212' }, // lime-200
  { fill: '#c7d2fe', stroke: '#6366f1', text: '#3730a3' }, // indigo-200
];

function getPieceColor(index: number) {
  return PIECE_COLORS[index % PIECE_COLORS.length];
}

function getUsageColor(pct: number): string {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#f59e0b';
  return '#ef4444';
}

function getUsageBgClass(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function getUsageTextClass(pct: number): string {
  if (pct >= 80) return 'text-green-700';
  if (pct >= 60) return 'text-amber-700';
  return 'text-red-700';
}

// ============ SVG CUTTING PLAN ============

const MARGIN = 40; // px margin for dimension labels
const COMPACT_MARGIN = 10;

export function CuttingPlanViewer({
  fuente,
  piezas,
  sobrantes,
  porcentajeUso,
  compact = false,
}: CuttingPlanViewerProps) {
  const margin = compact ? COMPACT_MARGIN : MARGIN;

  // Calculate viewBox so SVG scales proportionally
  const svgWidth = fuente.largo + margin * 2;
  const svgHeight = fuente.ancho + margin * 2;

  const colorMap = useMemo(() => {
    const map: Record<string, (typeof PIECE_COLORS)[0]> = {};
    piezas.forEach((p, i) => {
      if (!map[p.id]) {
        map[p.id] = getPieceColor(Object.keys(map).length);
      }
    });
    return map;
  }, [piezas]);

  return (
    <div className="w-full space-y-3">
      {/* Header label */}
      {!compact && fuente.label && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <RulerIcon className="h-4 w-4" />
          <span>
            {fuente.tipo === 'lamina' ? 'Lamina' : 'Sobrante'}:{' '}
            {fuente.label} ({fuente.largo} x {fuente.ancho} cm)
          </span>
        </div>
      )}

      {/* SVG drawing */}
      <div className="w-full overflow-hidden rounded-lg border bg-white">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: compact ? 180 : 420 }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Hatching pattern for sobrantes */}
            <pattern
              id="hatch-remnant"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>

          {/* Source material rectangle */}
          <rect
            x={margin}
            y={margin}
            width={fuente.largo}
            height={fuente.ancho}
            fill="#f9fafb"
            stroke="#9ca3af"
            strokeWidth={2}
          />

          {/* Dimension labels on edges */}
          {!compact && (
            <>
              {/* Top: largo */}
              <line
                x1={margin}
                y1={margin - 12}
                x2={margin + fuente.largo}
                y2={margin - 12}
                stroke="#6b7280"
                strokeWidth={1}
                markerStart="url(#arrowL)"
                markerEnd="url(#arrowR)"
              />
              <text
                x={margin + fuente.largo / 2}
                y={margin - 18}
                textAnchor="middle"
                fontSize={Math.min(14, fuente.largo * 0.06)}
                fill="#374151"
                fontFamily="sans-serif"
              >
                {fuente.largo} cm
              </text>

              {/* Left: ancho */}
              <line
                x1={margin - 12}
                y1={margin}
                x2={margin - 12}
                y2={margin + fuente.ancho}
                stroke="#6b7280"
                strokeWidth={1}
              />
              <text
                x={margin - 18}
                y={margin + fuente.ancho / 2}
                textAnchor="middle"
                fontSize={Math.min(14, fuente.ancho * 0.06)}
                fill="#374151"
                fontFamily="sans-serif"
                transform={`rotate(-90, ${margin - 18}, ${margin + fuente.ancho / 2})`}
              >
                {fuente.ancho} cm
              </text>

              {/* Dimension tick marks */}
              <line x1={margin} y1={margin - 8} x2={margin} y2={margin - 16} stroke="#6b7280" strokeWidth={1} />
              <line x1={margin + fuente.largo} y1={margin - 8} x2={margin + fuente.largo} y2={margin - 16} stroke="#6b7280" strokeWidth={1} />
              <line x1={margin - 8} y1={margin} x2={margin - 16} y2={margin} stroke="#6b7280" strokeWidth={1} />
              <line x1={margin - 8} y1={margin + fuente.ancho} x2={margin - 16} y2={margin + fuente.ancho} stroke="#6b7280" strokeWidth={1} />
            </>
          )}

          {/* Sobrantes (remnants) with hatching */}
          {sobrantes.map((s, i) => (
            <g key={`sobrante-${i}`}>
              <rect
                x={margin + s.x}
                y={margin + s.y}
                width={s.largo}
                height={s.ancho}
                fill="url(#hatch-remnant)"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <rect
                x={margin + s.x}
                y={margin + s.y}
                width={s.largo}
                height={s.ancho}
                fill="#e5e7eb"
                opacity={0.4}
                stroke="none"
              />
              {!compact && s.largo > 30 && s.ancho > 20 && (
                <text
                  x={margin + s.x + s.largo / 2}
                  y={margin + s.y + s.ancho / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(11, s.largo * 0.08, s.ancho * 0.15)}
                  fill="#6b7280"
                  fontFamily="sans-serif"
                >
                  {s.largo}x{s.ancho}
                </text>
              )}
            </g>
          ))}

          {/* Pieces */}
          {piezas.map((p, i) => {
            const color = colorMap[p.id] || getPieceColor(i);
            const fontSize = compact
              ? 0
              : Math.min(12, p.largo * 0.07, p.ancho * 0.14);
            const dimFontSize = compact
              ? 0
              : Math.min(10, p.largo * 0.06, p.ancho * 0.12);
            const showLabel = !compact && p.largo > 25 && p.ancho > 18;
            const showDims = !compact && p.largo > 35 && p.ancho > 25;

            return (
              <g key={p.id}>
                <rect
                  x={margin + p.x}
                  y={margin + p.y}
                  width={p.largo}
                  height={p.ancho}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={1.5}
                  rx={2}
                />
                {showLabel && (
                  <text
                    x={margin + p.x + p.largo / 2}
                    y={margin + p.y + p.ancho / 2 - (showDims ? dimFontSize * 0.6 : 0)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight="600"
                    fill={color.text}
                    fontFamily="sans-serif"
                  >
                    {p.label}
                  </text>
                )}
                {showDims && (
                  <text
                    x={margin + p.x + p.largo / 2}
                    y={margin + p.y + p.ancho / 2 + fontSize * 0.7}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={dimFontSize}
                    fill={color.text}
                    fontFamily="sans-serif"
                    opacity={0.75}
                  >
                    {p.largo}x{p.ancho}{p.rotada ? ' R' : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Usage bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Aprovechamiento
          </span>
          <span className={`font-bold ${getUsageTextClass(porcentajeUso)}`}>
            {porcentajeUso.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getUsageBgClass(porcentajeUso)}`}
            style={{ width: `${Math.min(100, porcentajeUso)}%` }}
          />
        </div>
      </div>

      {/* Legend (non-compact only) */}
      {!compact && piezas.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {Object.entries(colorMap).map(([id, color]) => {
            const pieza = piezas.find((p) => p.id === id);
            return (
              <div key={id} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-3 w-3 rounded-sm border"
                  style={{
                    backgroundColor: color.fill,
                    borderColor: color.stroke,
                  }}
                />
                <span className="text-muted-foreground">
                  {pieza?.label ?? id}
                </span>
              </div>
            );
          })}
          {sobrantes.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-block h-3 w-3 rounded-sm border border-dashed border-gray-400 bg-gray-200" />
              <span className="text-muted-foreground">Sobrante</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ CUTTING PLAN SUMMARY ============

export function CuttingPlanSummary({
  resumen,
}: {
  resumen: CuttingPlanResumen;
}) {
  const pct = resumen.porcentajeAprovechamiento;
  const usageColor = getUsageTextClass(pct);
  const usageBg = getUsageBgClass(pct);

  const formatArea = (cm2: number) => {
    if (cm2 >= 10000) {
      return `${(cm2 / 10000).toFixed(2)} m\u00B2`;
    }
    return `${cm2.toLocaleString()} cm\u00B2`;
  };

  const stats = [
    {
      label: 'Total piezas',
      value: resumen.totalPiezas,
      icon: Scissors,
    },
    {
      label: 'Laminas usadas',
      value: resumen.laminasUsadas,
      icon: Layers,
    },
    {
      label: 'Sobrantes reutilizados',
      value: resumen.sobrantesReutilizados,
      icon: Recycle,
    },
    {
      label: 'Nuevos sobrantes',
      value: resumen.nuevosSobrantes,
      icon: PlusSquare,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Resumen del Plan de Corte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <p className="text-xl font-bold tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Usage percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Aprovechamiento</span>
            <span className={`text-lg font-bold ${usageColor}`}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usageBg}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        {/* Area breakdown */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Desglose de area
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Area total</p>
              <p className="font-semibold">{formatArea(resumen.areaTotalCm2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Area usada</p>
              <p className="font-semibold text-green-700">
                {formatArea(resumen.areaUsadaCm2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Desperdicio</p>
              <p className="font-semibold text-red-700">
                {formatArea(resumen.desperdicioCm2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
