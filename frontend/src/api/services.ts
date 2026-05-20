import api from './client'
import type {
  Bodega,
  Zona,
  Objeto,
  Movimiento,
  Contrato,
  Categoria,
  AccesoPersona,
  Usuario,
  DashboardAdmin,
  DashboardUsuario,
} from '../types'

// ============================
// Auth
// ============================
export const authApi = {
  sync: (data: { nombreCompleto: string; numeroIdentificacion?: string }) =>
    api.post<Usuario>('/auth/sync', data),
  me: () => api.get<Usuario>('/auth/me'),
}

// ============================
// Bodegas
// ============================
export const bodegaApi = {
  listar: (estado?: string) =>
    api.get<Bodega[]>('/bodegas', { params: { estado } }),
  obtener: (id: number) => api.get<Bodega>(`/bodegas/${id}`),
  crear: (data: Partial<Bodega>) => api.post<Bodega>('/bodegas', data),
  actualizar: (id: number, data: Partial<Bodega>) => api.put<Bodega>(`/bodegas/${id}`, data),
  eliminar: (id: number) => api.delete(`/bodegas/${id}`),
}

// ============================
// Zonas
// ============================
export const zonaApi = {
  listarPorBodega: (bodegaId: number) =>
    api.get<Zona[]>(`/zonas/bodega/${bodegaId}`),
  obtener: (id: number) => api.get<Zona>(`/zonas/${id}`),
  crear: (data: Partial<Zona>) => api.post<Zona>('/zonas', data),
  actualizar: (id: number, data: Partial<Zona>) => api.put<Zona>(`/zonas/${id}`, data),
  eliminar: (id: number) => api.delete(`/zonas/${id}`),
}

// ============================
// Objetos
// ============================
export const objetoApi = {
  misObjetos: () => api.get<Objeto[]>('/objetos/mis-objetos'),
  porBodega: (bodegaId: number) => api.get<Objeto[]>(`/objetos/bodega/${bodegaId}`),
  alertasStock: () => api.get<Objeto[]>('/objetos/alertas-stock'),
  crear: (data: Partial<Objeto>) => api.post<Objeto>('/objetos', data),
  actualizar: (id: number, data: Partial<Objeto>) => api.put<Objeto>(`/objetos/${id}`, data),
  eliminar: (id: number) => api.delete(`/objetos/${id}`),
}

// ============================
// Movimientos
// ============================
export const movimientoApi = {
  registrar: (data: Partial<Movimiento>) => api.post<Movimiento>('/movimientos', data),
  porBodega: (bodegaId: number) => api.get<Movimiento[]>(`/movimientos/bodega/${bodegaId}`),
  porObjeto: (objetoId: number) => api.get<Movimiento[]>(`/movimientos/objeto/${objetoId}`),
}

// ============================
// Contratos
// ============================
export const contratoApi = {
  listarTodos: () => api.get<Contrato[]>('/contratos'),
  proximosAVencer: (dias: number = 30) =>
    api.get<Contrato[]>('/contratos/proximos-vencer', { params: { dias } }),
  crear: (data: Partial<Contrato>) => api.post<Contrato>('/contratos', data),
  terminar: (id: number) => api.patch<Contrato>(`/contratos/${id}/terminar`),
}

// ============================
// Accesos (Seguridad)
// ============================
export const accesoApi = {
  registrarEntrada: (data: Partial<AccesoPersona>) =>
    api.post<AccesoPersona>('/accesos/entrada', data),
  registrarSalida: (id: number) => api.patch<AccesoPersona>(`/accesos/${id}/salida`),
  porBodega: (bodegaId: number) => api.get<AccesoPersona[]>(`/accesos/bodega/${bodegaId}`),
  historialPersona: (identificacion: string) =>
    api.get<AccesoPersona[]>(`/accesos/persona/${identificacion}`),
}

// ============================
// Dashboard
// ============================
export const dashboardApi = {
  admin: () => api.get<DashboardAdmin>('/dashboard/admin'),
  usuario: () => api.get<DashboardUsuario>('/dashboard/usuario'),
}

// ============================
// Audit (Admin)
// ============================
export const auditApi = {
  listarTodos: () =>	api.get<any[]>('/admin/audit'),
  porTabla: (tabla: string) => api.get<any[]>(`/admin/audit/tabla/${tabla}`),
}