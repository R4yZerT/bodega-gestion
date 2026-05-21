export type RolUsuario = 'ADMIN' | 'USUARIO' | 'SEGURIDAD'

export interface Usuario {
  id: string
  email: string
  nombreCompleto: string
  rol: RolUsuario
  activo: boolean
}

export type EstadoBodega = 'LIBRE' | 'RESERVADA' | 'EN_USO'

export interface Bodega {
  id: number
  nombre: string
  ubicacion: string
  capacidadM3: number
  volumenOcupadoM3: number
  volumenLibreM3: number
  porcentajeOcupacion: number
  estado: EstadoBodega
  descripcion: string | null
}

export interface Zona {
  id: number
  nombre: string
  descripcion: string | null
  bodegaId: number
  capacidadM3: number
  volumenOcupadoM3: number
  volumenLibreM3: number
  porcentajeOcupacion: number
  posicionX: number
  posicionY: number
  ancho: number
  alto: number
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

export interface Objeto {
  id: number
  nombre: string
  cantidad: number
  largoCm: number | null
  anchoCm: number | null
  altoCm: number | null
  stockMinimo: number | null
  categoriaId: number | null
  bodegaId: number
  zonaId: number | null
  usuarioId: string
}

export interface ObjetoConVolumen extends Objeto {
  volumenTotalM3: number
}

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  objetoId: number
  bodegaId: number
  cantidad: number
  observaciones: string | null
  registradoPor: string | null
  fechaMovimiento: string
}

export interface Contrato {
  id: number
  usuarioId: string
  bodegaId: number
  fechaInicio: string
  fechaFin: string
  canonMensual: number
  activo: boolean
  urlDocumento: string | null
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  usuarioId: string | null
}

export interface AccesoPersona {
  id: number
  nombrePersona: string
  identificacion: string
  bodegaId: number
  horaEntrada: string
  horaSalida: string | null
  observaciones: string | null
}

export interface AuditLog {
  id: number
  usuarioId: string | null
  accion: string
  tabla: string
  registroId: string | null
  datosAnteriores: string | null
  datosNuevos: string | null
  ipOrigen: string | null
  createdAt: string
}

export interface DashboardAdmin {
  totalBodegas: number
  bodegasLibres: number
  bodegasEnUso: number
  bodegasReservadas: number
  ocupacionGlobalPorcentaje: number
}

export interface DashboardUsuario {
  totalObjetos: number
  objetosBajoStock: number
  volumenOcupadoM3: number
  volumenTotalM3: number
  porcentajeOcupacionUsuario: number
  ultimosMovimientos: Movimiento[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
}