// ============ ENUMS ============
export type UserRole = 'director' | 'admin' | 'rrhh' | 'jefe_taller' | 'residente' | 'chofer' | 'marmolero';
export type ObraEstatus = 'activa' | 'pausada' | 'completada' | 'cancelada';
export type PiezaEstatus = 'fabricada' | 'enviada' | 'recibida' | 'instalada' | 'verificada' | 'pendiente_detalle';
export type MaterialTipo = 'lamina' | 'insumo' | 'herramienta' | 'combustible';
export type LaminaEstado = 'disponible' | 'en_corte' | 'agotada';
export type MovTipo = 'entrada' | 'salida';
export type RemisionEstatus = 'creada' | 'en_transito' | 'entregada';
export type OcEstatus = 'pendiente' | 'aprobada' | 'recibida' | 'cancelada';
export type FotoTipo = 'carga' | 'entrega' | 'instalacion' | 'verificacion' | 'daño';
export type AsistenciaTipo = 'normal' | 'retardo' | 'falta' | 'permiso';
export type EstimacionEstatus = 'borrador' | 'enviada' | 'cobrada';
export type NotifTipo = 'asistencia' | 'remision' | 'entrega' | 'instalacion' | 'compra' | 'alerta' | 'general';

// ============ TABLES ============
export interface User {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  role: UserRole;
  activo: boolean;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: string;
  nombre: string;
  cliente: string;
  ubicacion: string | null;
  contrato_total: number;
  anticipo_porcentaje: number;
  anticipo_recibido: number;
  retencion_porcentaje: number;
  residente_id: string | null;
  estatus: ObraEstatus;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptoObra {
  id: string;
  obra_id: string;
  tipo_pieza: string;
  descripcion: string | null;
  medida_largo: number;
  medida_ancho: number;
  medida_espesor: number | null;
  material_tipo: string;
  cantidad_vendida: number;
  cantidad_enviada: number;
  cantidad_instalada: number;
  cantidad_verificada: number;
  precio_unitario: number;
  created_at: string;
}

export interface Pieza {
  id: string;
  concepto_id: string;
  remision_id: string | null;
  estatus: PiezaEstatus;
  notas: string | null;
  instalado_por: string | null;
  verificado_por: string | null;
  fecha_envio: string | null;
  fecha_recepcion: string | null;
  fecha_instalacion: string | null;
  fecha_verificacion: string | null;
  created_at: string;
}

export interface Material {
  id: string;
  tipo: MaterialTipo;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  precio_referencia: number | null;
  activo: boolean;
  created_at: string;
}

export interface Lamina {
  id: string;
  material_id: string;
  tipo_piedra: string;
  largo_cm: number;
  ancho_cm: number;
  espesor_cm: number;
  es_irregular: boolean;
  proveedor: string | null;
  lote: string | null;
  estado: LaminaEstado;
  foto_url: string | null;
  notas: string | null;
  created_at: string;
}

export interface MovimientoAlmacen {
  id: string;
  material_id: string;
  tipo: MovTipo;
  cantidad: number;
  obra_destino_id: string | null;
  remision_id: string | null;
  orden_compra_id: string | null;
  responsable_id: string;
  notas: string | null;
  created_at: string;
}

export interface Remision {
  id: string;
  folio: string;
  obra_id: string;
  chofer_id: string | null;
  creado_por: string;
  estatus: RemisionEstatus;
  pdf_url: string | null;
  notas: string | null;
  created_at: string;
  // Joined
  obra?: Obra;
  chofer?: User;
  items?: RemisionItem[];
}

export interface RemisionItem {
  id: string;
  remision_id: string;
  concepto_id: string;
  cantidad: number;
  descripcion: string | null;
  // Joined
  concepto?: ConceptoObra;
}

export interface OrdenCompra {
  id: string;
  folio: string;
  proveedor: string;
  estatus: OcEstatus;
  total: number;
  creado_por: string;
  aprobado_por: string | null;
  notas: string | null;
  created_at: string;
}

export interface OrdenCompraItem {
  id: string;
  orden_id: string;
  material_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Vehiculo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  placas: string | null;
  chofer_asignado_id: string | null;
  activo: boolean;
  created_at: string;
}

export interface GastoGasolina {
  id: string;
  chofer_id: string;
  vehiculo_id: string | null;
  monto: number;
  litros: number | null;
  tarjeta_id: string | null;
  foto_ticket_url: string | null;
  created_at: string;
}

export interface UbicacionChofer {
  id: string;
  chofer_id: string;
  latitud: number;
  longitud: number;
  velocidad_kmh: number | null;
  created_at: string;
}

export interface Foto {
  id: string;
  obra_id: string;
  pieza_id: string | null;
  remision_id: string | null;
  tipo: FotoTipo;
  url: string;
  notas: string | null;
  subido_por: string;
  created_at: string;
}

export interface Asistencia {
  id: string;
  usuario_id: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  tipo: AsistenciaTipo;
  obra_asignada_id: string | null;
  registrado_en: 'planta' | 'obra';
  created_at: string;
  // Joined
  usuario?: User;
}

export interface FinanzasObra {
  id: string;
  obra_id: string;
  contrato_total: number;
  anticipo_recibido: number;
  estimado_acumulado: number;
  retenido_acumulado: number;
  cobrado_acumulado: number;
  updated_at: string;
}

export interface Estimacion {
  id: string;
  obra_id: string;
  numero: number;
  monto_bruto: number;
  retenciones: number;
  monto_neto: number;
  piezas_incluidas: string | null;
  estatus: EstimacionEstatus;
  created_at: string;
}

export interface Desperdicio {
  id: string;
  tipo_material: string;
  largo_cm: number;
  ancho_cm: number;
  espesor_cm: number;
  es_irregular: boolean;
  calidad: 'buena' | 'regular' | 'solo_piezas_pequeñas';
  ubicacion_planta: string | null;
  foto_url: string | null;
  disponible: boolean;
  usado_en_pieza_id: string | null;
  lamina_id: string | null;
  notas: string | null;
  created_at: string;
}

export interface Notificacion {
  id: string;
  user_id: string;
  tipo: NotifTipo;
  titulo: string;
  mensaje: string;
  obra_id: string | null;
  leida: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tabla: string;
  registro_id: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  usuario_id: string;
  created_at: string;
}

// ============ ROLE CONFIG ============
export const ROLE_CONFIG: Record<UserRole, { label: string; home: string; prefix: string }> = {
  director: { label: 'Director', home: '/director/dashboard', prefix: '/director' },
  admin: { label: 'Administración', home: '/admin/dashboard', prefix: '/admin' },
  rrhh: { label: 'RRHH', home: '/rrhh/personal', prefix: '/rrhh' },
  jefe_taller: { label: 'Jefe de Taller', home: '/taller/dashboard', prefix: '/taller' },
  residente: { label: 'Residente de Obra', home: '/obra/dashboard', prefix: '/obra' },
  chofer: { label: 'Chofer', home: '/chofer/cargas', prefix: '/chofer' },
  marmolero: { label: 'Marmolero', home: '/marmolero/asistencia', prefix: '/marmolero' },
};

// Semáforo colors for pieza status
export const PIEZA_SEMAFORO: Record<PiezaEstatus, 'rojo' | 'amarillo' | 'verde'> = {
  fabricada: 'rojo',
  enviada: 'amarillo',
  recibida: 'amarillo',
  instalada: 'amarillo',
  verificada: 'verde',
  pendiente_detalle: 'amarillo',
};
