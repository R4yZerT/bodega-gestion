import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { contratoApi, bodegaApi, zonaApi, objetoApi } from '../../api/services'
import type { ContratoResponse, Bodega, Zona, ObjetoResponse } from '../../types'
import { FileText, Plus, Download, ChevronDown, CheckCircle, X, ClipboardList } from 'lucide-react'
import { useToast } from '../../components/ui/ToastProvider'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ---------------------------------------------------------------------------
// PDF helpers
// ---------------------------------------------------------------------------

function pdfHeader(doc: jsPDF, titulo: string, subtitulo?: string) {
  doc.setFillColor(41, 128, 185)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BodegaGestión', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Gestión de Bodegas', 14, 19)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 210 - 14, 12, { align: 'right' })
  if (subtitulo) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitulo, 210 - 14, 19, { align: 'right' })
  }
  doc.setTextColor(0, 0, 0)
}

function pdfSectionTitle(doc: jsPDF, texto: string, y: number) {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(41, 128, 185)
  doc.text(texto.toUpperCase(), 14, y)
  doc.setDrawColor(41, 128, 185)
  doc.line(14, y + 1.5, 196, y + 1.5)
  doc.setTextColor(0)
  return y + 6
}

function pdfFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `BodegaGestión — Documento generado el ${new Date().toLocaleDateString('es-CO')} — Pág. ${i}/${pages}`,
      105, 290, { align: 'center' }
    )
    doc.setTextColor(0)
  }
}

function mesesEntre(inicio: string, fin: string) {
  const d1 = new Date(inicio)
  const d2 = new Date(fin)
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30)))
}

// ── Cotización ────────────────────────────────────────────────────────────────
function generarCotizacionPDF(
  bodega: Bodega,
  zonas: Zona[],
  form: { usuarioId: string; nombreCliente: string; fechaInicio: string; fechaFin: string; canonMensual: string }
) {
  const doc = new jsPDF()
  const hoy = new Date()
  const vigencia = new Date(hoy)
  vigencia.setDate(vigencia.getDate() + 30)
  const meses = mesesEntre(form.fechaInicio, form.fechaFin)
  const canon = parseFloat(form.canonMensual) || 0
  const total = canon * meses
  const fmt = (n: number) => n.toLocaleString('es-CO')

  pdfHeader(doc, 'COTIZACIÓN', `N° COT-${Date.now().toString().slice(-6)}`)

  let y = 38

  // Metadatos
  autoTable(doc, {
    startY: y,
    body: [
      ['Fecha de cotización:', hoy.toLocaleDateString('es-CO'), 'Válida hasta:', vigencia.toLocaleDateString('es-CO')],
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 2: { fontStyle: 'bold', cellWidth: 35 } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // Cliente
  y = pdfSectionTitle(doc, 'Datos del Solicitante', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Nombre / Razón social:', form.nombreCliente || '—'],
      ['ID de usuario:', form.usuarioId],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Bodega
  y = pdfSectionTitle(doc, 'Bodega Propuesta', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Nombre:', bodega.nombre, 'Estado actual:', bodega.estado],
      ['Ubicación:', bodega.ubicacion, 'Capacidad total:', `${fmt(bodega.capacidadM3)} m³`],
      ['Volumen libre:', `${fmt(bodega.volumenLibreM3)} m³`, '% Disponible:', `${(100 - bodega.porcentajeOcupacion).toFixed(1)}%`],
      ...(bodega.descripcion ? [['Descripción:', bodega.descripcion, '', '']] : []),
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 2: { fontStyle: 'bold', cellWidth: 40 } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Zonas
  if (zonas.length > 0) {
    y = pdfSectionTitle(doc, 'Zonas Disponibles', y)
    autoTable(doc, {
      startY: y,
      head: [['Zona', 'Cap. Total (m³)', 'Ocupado (m³)', 'Libre (m³)', '% Ocup.']],
      body: zonas.map(z => [
        z.nombre,
        fmt(z.capacidadM3),
        fmt(z.volumenOcupadoM3),
        fmt(z.volumenLibreM3),
        `${z.porcentajeOcupacion.toFixed(1)}%`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // Resumen financiero
  if (y > 220) { doc.addPage(); y = 20 }
  y = pdfSectionTitle(doc, 'Resumen Financiero', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Canon mensual:', `$${fmt(canon)}`],
      ['Período:', `${new Date(form.fechaInicio).toLocaleDateString('es-CO')} al ${new Date(form.fechaFin).toLocaleDateString('es-CO')}`],
      ['Duración estimada:', `${meses} ${meses === 1 ? 'mes' : 'meses'}`],
      ['Total estimado:', `$${fmt(total)}`],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65 } },
    didParseCell: (data) => {
      if (data.row.index === 3) data.cell.styles.fontStyle = 'bold'
    },
  })
  y = (doc as any).lastAutoTable.finalY + 10

  // Nota
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text('* Esta cotización no constituye reserva de la bodega. Tiene vigencia de 30 días a partir de la fecha de emisión.', 14, y)
  doc.text('* Los valores son estimados y pueden variar según condiciones acordadas al momento de la firma del contrato.', 14, y + 5)

  pdfFooter(doc)
  doc.save(`cotizacion-${bodega.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

// ── Contrato para firmar ─────────────────────────────────────────────────────
function generarContratoPDF(contrato: ContratoResponse, bodega: Bodega, zonas: Zona[]) {
  const doc = new jsPDF()
  const meses = mesesEntre(contrato.fechaInicio, contrato.fechaFin)
  const total = contrato.canonMensual * meses
  const fmt = (n: number) => n.toLocaleString('es-CO')

  pdfHeader(doc, 'CONTRATO', `N° ${String(contrato.id).padStart(6, '0')}`)

  let y = 38

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRATO DE ARRENDAMIENTO DE BODEGA', 105, y, { align: 'center' })
  y += 8

  // Partes
  y = pdfSectionTitle(doc, 'Partes del Contrato', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['ARRENDADOR', 'BodegaGestión S.A.S. — NIT: 000.000.000-0\nRepresentante Legal: Administrador del Sistema'],
      ['ARRENDATARIO', `${contrato.usuarioNombre}\nID de usuario: ${contrato.usuarioId}`],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, valign: 'middle' } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Objeto
  y = pdfSectionTitle(doc, 'Objeto del Contrato', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Bodega:', bodega.nombre],
      ['Ubicación:', bodega.ubicacion],
      ['Capacidad total:', `${fmt(bodega.capacidadM3)} m³`],
      ...(bodega.descripcion ? [['Descripción:', bodega.descripcion]] : []),
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Zonas
  if (zonas.length > 0) {
    y = pdfSectionTitle(doc, 'Zonas Incluidas', y)
    autoTable(doc, {
      startY: y,
      head: [['Zona', 'Capacidad (m³)', 'Libre (m³)']],
      body: zonas.map(z => [z.nombre, fmt(z.capacidadM3), fmt(z.volumenLibreM3)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // Términos económicos
  if (y > 200) { doc.addPage(); y = 20 }
  y = pdfSectionTitle(doc, 'Términos Económicos y Vigencia', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Fecha de inicio:', new Date(contrato.fechaInicio).toLocaleDateString('es-CO')],
      ['Fecha de terminación:', new Date(contrato.fechaFin).toLocaleDateString('es-CO')],
      ['Duración:', `${meses} ${meses === 1 ? 'mes' : 'meses'}`],
      ['Canon mensual:', `$${fmt(contrato.canonMensual)}`],
      ['Valor total del contrato:', `$${fmt(total)}`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 65 } },
    didParseCell: (data) => {
      if (data.row.index === 4) data.cell.styles.fontStyle = 'bold'
    },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Cláusulas
  if (y > 200) { doc.addPage(); y = 20 }
  y = pdfSectionTitle(doc, 'Cláusulas', y)
  const clausulas = [
    'PRIMERA — OBJETO: El Arrendador entrega al Arrendatario el uso y goce del espacio descrito en este contrato, exclusivamente para almacenamiento de los bienes declarados.',
    'SEGUNDA — CANON: El Arrendatario se obliga a pagar el canon mensual acordado dentro de los primeros cinco (5) días de cada mes.',
    'TERCERA — OBLIGACIONES DEL ARRENDATARIO: Cuidar el espacio, no realizar actividades ilícitas, permitir inspecciones y restituir el espacio en las condiciones recibidas.',
    'CUARTA — TERMINACIÓN: Cualquiera de las partes podrá dar por terminado el contrato con treinta (30) días de antelación mediante comunicación escrita.',
    'QUINTA — LEGISLACIÓN APLICABLE: Este contrato se rige por las leyes de la República de Colombia.',
  ]
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  clausulas.forEach((c) => {
    const lines = doc.splitTextToSize(c, 182)
    if (y + lines.length * 5 > 270) { doc.addPage(); y = 20 }
    doc.text(lines, 14, y)
    y += lines.length * 5 + 3
  })

  // Firmas
  y += 8
  if (y > 240) { doc.addPage(); y = 20 }
  y = pdfSectionTitle(doc, 'Firmas', y)
  y += 6
  doc.setFontSize(9)
  doc.text('Lugar y fecha: ___________________________', 14, y)
  y += 16

  // Líneas de firma
  doc.line(14, y, 88, y)
  doc.line(122, y, 196, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('ARRENDADOR', 51, y, { align: 'center' })
  doc.text('ARRENDATARIO', 159, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text('BodegaGestión S.A.S.', 51, y, { align: 'center' })
  doc.text(contrato.usuarioNombre, 159, y, { align: 'center' })

  // Sello PENDIENTE DE PAGO
  doc.setTextColor(220, 53, 69)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PENDIENTE DE PAGO', 105, 278, { align: 'center' })
  doc.setLineWidth(0.5)
  doc.setDrawColor(220, 53, 69)
  doc.roundedRect(50, 272, 110, 10, 2, 2)
  doc.setTextColor(0)
  doc.setDrawColor(0)

  pdfFooter(doc)
  doc.save(`contrato-${String(contrato.id).padStart(6, '0')}-${bodega.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

// ── Contrato confirmado ──────────────────────────────────────────────────────
function generarContratoConfirmadoPDF(contrato: ContratoResponse, bodega: Bodega) {
  const doc = new jsPDF()
  const meses = mesesEntre(contrato.fechaInicio, contrato.fechaFin)
  const total = contrato.canonMensual * meses
  const fmt = (n: number) => n.toLocaleString('es-CO')

  pdfHeader(doc, 'CONTRATO ACTIVO', `N° ${String(contrato.id).padStart(6, '0')}`)

  let y = 38

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRATO DE ARRENDAMIENTO — PAGO VALIDADO', 105, y, { align: 'center' })
  y += 8

  y = pdfSectionTitle(doc, 'Partes del Contrato', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['ARRENDADOR', 'BodegaGestión S.A.S. — NIT: 000.000.000-0'],
      ['ARRENDATARIO', `${contrato.usuarioNombre}\nID: ${contrato.usuarioId}`],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  y = pdfSectionTitle(doc, 'Bodega Asignada', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Bodega:', bodega.nombre],
      ['Ubicación:', bodega.ubicacion],
      ['Capacidad total:', `${fmt(bodega.capacidadM3)} m³`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  y = pdfSectionTitle(doc, 'Condiciones del Contrato', y)
  autoTable(doc, {
    startY: y,
    body: [
      ['Vigencia:', `${new Date(contrato.fechaInicio).toLocaleDateString('es-CO')} al ${new Date(contrato.fechaFin).toLocaleDateString('es-CO')}`],
      ['Duración:', `${meses} ${meses === 1 ? 'mes' : 'meses'}`],
      ['Canon mensual:', `$${fmt(contrato.canonMensual)}`],
      ['Valor total:', `$${fmt(total)}`],
      ['Estado:', 'ACTIVO — PAGO VALIDADO'],
      ['Fecha de confirmación:', new Date().toLocaleDateString('es-CO')],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    theme: 'striped',
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
    didParseCell: (data) => {
      if (data.row.index === 4 && data.column.index === 1)
        data.cell.styles.textColor = [34, 197, 94]
    },
  })
  y = (doc as any).lastAutoTable.finalY + 30

  // Firmas
  y = pdfSectionTitle(doc, 'Firmas y Validación', y)
  y += 6
  doc.line(14, y, 88, y)
  doc.line(122, y, 196, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('ARRENDADOR', 51, y, { align: 'center' })
  doc.text('ARRENDATARIO', 159, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text('BodegaGestión S.A.S.', 51, y, { align: 'center' })
  doc.text(contrato.usuarioNombre, 159, y, { align: 'center' })

  // Sello PAGO VALIDADO
  doc.setTextColor(34, 139, 34)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('✓ PAGO VALIDADO', 105, 278, { align: 'center' })
  doc.setLineWidth(0.7)
  doc.setDrawColor(34, 139, 34)
  doc.roundedRect(48, 272, 114, 10, 2, 2)
  doc.setTextColor(0)
  doc.setDrawColor(0)

  pdfFooter(doc)
  doc.save(`contrato-confirmado-${String(contrato.id).padStart(6, '0')}.pdf`)
}

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------
interface FormState {
  usuarioId: string
  nombreCliente: string
  bodegaId: string
  fechaInicio: string
  fechaFin: string
  canonMensual: string
}

interface BodegaDetalle {
  bodega: Bodega
  contratos: ContratoResponse[]
  zonas: Zona[]
  objetos: ObjetoResponse[]
}

const FORM_INICIAL: FormState = {
  usuarioId: '', nombreCliente: '', bodegaId: '',
  fechaInicio: '', fechaFin: '', canonMensual: '',
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function ContratosPage() {
  const [contratos, setContratos] = useState<ContratoResponse[]>([])
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Flujo cotización → contrato
  const [showFlujo, setShowFlujo] = useState(false)
  const [flujoStep, setFlujoStep] = useState<'form' | 'contrato'>('form')
  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [bodegaPreview, setBodegaPreview] = useState<Bodega | null>(null)
  const [zonasPreview, setZonasPreview] = useState<Zona[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [contratoCreado, setContratoCreado] = useState<ContratoResponse | null>(null)
  const [creandoContrato, setCreandoContrato] = useState(false)

  // Informe por bodega
  const [selectedBodegaId, setSelectedBodegaId] = useState<string>('')
  const [detalle, setDetalle] = useState<BodegaDetalle | null>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  const toast = useToast()

  const loadData = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      contratoApi.listarTodos(),
      bodegaApi.listar(),
    ])
      .then(([cRes, bRes]) => { setContratos(cRes.data); setBodegas(bRes.data) })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  // Cuando cambia la bodega en el formulario, carga preview
  const handleBodegaFormChange = async (bodegaId: string) => {
    setForm(f => ({ ...f, bodegaId }))
    setBodegaPreview(null)
    setZonasPreview([])
    if (!bodegaId) return
    setLoadingPreview(true)
    try {
      const [bRes, zRes] = await Promise.all([
        bodegaApi.obtener(Number(bodegaId)),
        zonaApi.listarPorBodega(Number(bodegaId)),
      ])
      setBodegaPreview(bRes.data)
      setZonasPreview(zRes.data)
    } catch { /* silencioso */ }
    finally { setLoadingPreview(false) }
  }

  const puedeDescargarCotizacion =
    !!form.usuarioId && !!form.bodegaId && !!form.fechaInicio && !!form.fechaFin && !!form.canonMensual && !!bodegaPreview

  const handleDescargarCotizacion = () => {
    if (!bodegaPreview) return
    generarCotizacionPDF(bodegaPreview, zonasPreview, form)
  }

  const handleCrearContrato = async () => {
    if (!bodegaPreview) return
    if (!confirm('¿Crear el contrato? La bodega quedará en estado RESERVADA hasta validar el pago.')) return
    setCreandoContrato(true)
    try {
      const res = await contratoApi.crear({
        usuarioId: form.usuarioId,
        bodegaId: Number(form.bodegaId),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        canonMensual: parseFloat(form.canonMensual),
      })
      setContratoCreado(res.data)
      setFlujoStep('contrato')
      loadData()
      toast.success('Contrato creado. Bodega en estado RESERVADA.')
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Error al crear contrato')
    } finally {
      setCreandoContrato(false)
    }
  }

  const handleDescargarContrato = () => {
    if (!contratoCreado || !bodegaPreview) return
    generarContratoPDF(contratoCreado, bodegaPreview, zonasPreview)
  }

  const cerrarFlujo = () => {
    setShowFlujo(false)
    setFlujoStep('form')
    setForm(FORM_INICIAL)
    setBodegaPreview(null)
    setZonasPreview([])
    setContratoCreado(null)
  }

  const handleTerminar = async (id: number) => {
    if (!confirm('¿Terminar este contrato? La bodega quedará libre.')) return
    try {
      await contratoApi.terminar(id)
      loadData()
      toast.success('Contrato terminado exitosamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al terminar contrato')
    }
  }

  const handleValidarPago = async (contrato: ContratoResponse) => {
    if (!confirm(`¿Validar pago del contrato N° ${contrato.id}? La bodega pasará a estado EN_USO.`)) return
    try {
      const bodegaRes = await bodegaApi.obtener(contrato.bodegaId)
      const bodega = bodegaRes.data
      await bodegaApi.actualizar(contrato.bodegaId, { ...bodega, estado: 'EN_USO' })
      generarContratoConfirmadoPDF(contrato, bodega)
      loadData()
      toast.success('Pago validado. Bodega asignada y PDF generado.')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al validar pago')
    }
  }

  // Informe por bodega
  const handleSeleccionarBodega = async (bodegaId: string) => {
    setSelectedBodegaId(bodegaId)
    setDetalle(null)
    if (!bodegaId) return
    setLoadingDetalle(true)
    try {
      const id = Number(bodegaId)
      const [bRes, zRes, oRes] = await Promise.all([
        bodegaApi.obtener(id),
        zonaApi.listarPorBodega(id),
        objetoApi.porBodega(id),
      ])
      setDetalle({
        bodega: bRes.data,
        contratos: contratos.filter(c => c.bodegaId === id),
        zonas: zRes.data,
        objetos: oRes.data,
      })
    } catch { toast.error('Error al cargar información de la bodega') }
    finally { setLoadingDetalle(false) }
  }

  const generarInformePDF = () => {
    if (!detalle) return
    const { bodega, contratos: ctrs, zonas, objetos } = detalle
    const doc = new jsPDF()
    pdfHeader(doc, 'INFORME', bodega.nombre)
    let y = 38

    y = pdfSectionTitle(doc, 'Información General', y)
    autoTable(doc, {
      startY: y,
      body: [
        ['Nombre:', bodega.nombre, 'Estado:', bodega.estado],
        ['Ubicación:', bodega.ubicacion, 'Capacidad:', `${bodega.capacidadM3.toLocaleString('es-CO')} m³`],
        ['Ocupado:', `${bodega.volumenOcupadoM3.toLocaleString('es-CO')} m³`, 'Libre:', `${bodega.volumenLibreM3.toLocaleString('es-CO')} m³`],
        ['% Ocupación:', `${bodega.porcentajeOcupacion.toFixed(1)}%`, '', ''],
      ],
      styles: { fontSize: 9 }, theme: 'striped',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 }, 2: { fontStyle: 'bold', cellWidth: 35 } },
    })
    y = (doc as any).lastAutoTable.finalY + 8

    y = pdfSectionTitle(doc, `Contratos (${ctrs.length})`, y)
    if (ctrs.length === 0) { doc.setFontSize(9); doc.setTextColor(150); doc.text('Sin contratos', 14, y + 4); doc.setTextColor(0); y += 10 }
    else {
      autoTable(doc, {
        startY: y,
        head: [['ID', 'Cliente', 'Inicio', 'Fin', 'Canon', 'Estado']],
        body: ctrs.map(c => [c.id, c.usuarioNombre, new Date(c.fechaInicio).toLocaleDateString('es-CO'), new Date(c.fechaFin).toLocaleDateString('es-CO'), `$${Number(c.canonMensual).toLocaleString('es-CO')}`, c.activo ? 'Activo' : 'Terminado']),
        styles: { fontSize: 9 }, headStyles: { fillColor: [41, 128, 185] },
      })
      y = (doc as any).lastAutoTable.finalY + 8
    }

    y = pdfSectionTitle(doc, `Zonas (${zonas.length})`, y)
    if (zonas.length === 0) { doc.setFontSize(9); doc.setTextColor(150); doc.text('Sin zonas', 14, y + 4); doc.setTextColor(0); y += 10 }
    else {
      autoTable(doc, {
        startY: y,
        head: [['Zona', 'Cap. (m³)', 'Ocupado', 'Libre', '% Ocup.']],
        body: zonas.map(z => [z.nombre, z.capacidadM3, z.volumenOcupadoM3, z.volumenLibreM3, `${z.porcentajeOcupacion.toFixed(1)}%`]),
        styles: { fontSize: 9 }, headStyles: { fillColor: [41, 128, 185] },
      })
      y = (doc as any).lastAutoTable.finalY + 8
    }

    if (y > 220) { doc.addPage(); y = 20 }
    y = pdfSectionTitle(doc, `Inventario (${objetos.length} objetos)`, y)
    if (objetos.length === 0) { doc.setFontSize(9); doc.setTextColor(150); doc.text('Sin objetos', 14, y + 4); doc.setTextColor(0) }
    else {
      autoTable(doc, {
        startY: y,
        head: [['Objeto', 'Categoría', 'Cantidad', 'Volumen (m³)']],
        body: objetos.map(o => [o.nombre, o.categoriaNombre || '—', o.cantidad, o.volumenTotalM3]),
        styles: { fontSize: 9 }, headStyles: { fillColor: [41, 128, 185] },
      })
    }

    pdfFooter(doc)
    doc.save(`informe-bodega-${bodega.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-CO')
  const bodegaEstado = (bodegaId: number) => bodegas.find(b => b.id === bodegaId)?.estado
  const bodegasLibres = bodegas.filter(b => b.estado === 'LIBRE')

  const estadoColor: Record<string, string> = {
    LIBRE: '#22c55e', RESERVADA: '#f59e0b', EN_USO: '#3b82f6',
  }

  return (
    <Layout>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <FileText size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Contratos
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Gestión de contratos de arrendamiento</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowFlujo(true); setFlujoStep('form') }}>
          <Plus size={16} /> Nueva Cotización / Contrato
        </button>
      </div>

      {/* ── Flujo cotización → contrato ── */}
      {showFlujo && (
        <div className="card mb-3" style={{ borderLeft: '4px solid var(--primary)' }}>
          {/* Pasos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <StepBadge n={1} label="Cotización" active={flujoStep === 'form'} done={flujoStep === 'contrato'} />
            <div style={{ flex: 1, height: 2, background: flujoStep === 'contrato' ? 'var(--primary)' : 'var(--border)' }} />
            <StepBadge n={2} label="Contrato" active={flujoStep === 'contrato'} done={false} />
            <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
            <StepBadge n={3} label="Validar Pago" active={false} done={false} muted />
          </div>

          {/* ─── Step 1: Formulario ─── */}
          {flujoStep === 'form' && (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Datos de la Cotización</h3>
              <div className="grid grid-2">
                <div>
                  <label className="label">ID Usuario (UUID) *</label>
                  <input className="input" required value={form.usuarioId}
                    onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))} placeholder="UUID del usuario" />
                </div>
                <div>
                  <label className="label">Nombre del cliente</label>
                  <input className="input" value={form.nombreCliente}
                    onChange={e => setForm(f => ({ ...f, nombreCliente: e.target.value }))} placeholder="Para el PDF de cotización" />
                </div>
                <div>
                  <label className="label">Bodega (solo disponibles) *</label>
                  <select className="input" value={form.bodegaId} onChange={e => handleBodegaFormChange(e.target.value)}>
                    <option value="">Seleccionar bodega libre...</option>
                    {bodegasLibres.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre} — {b.capacidadM3} m³</option>
                    ))}
                  </select>
                  {bodegasLibres.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: 4 }}>No hay bodegas disponibles</p>
                  )}
                </div>
                <div>
                  <label className="label">Canon Mensual *</label>
                  <input className="input" type="number" step="0.01" value={form.canonMensual}
                    onChange={e => setForm(f => ({ ...f, canonMensual: e.target.value }))} placeholder="$ 0" />
                </div>
                <div>
                  <label className="label">Fecha Inicio *</label>
                  <input className="input" type="date" value={form.fechaInicio}
                    onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Fecha Fin *</label>
                  <input className="input" type="date" value={form.fechaFin}
                    onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} />
                </div>
              </div>

              {/* Preview de bodega seleccionada */}
              {loadingPreview && <p className="text-secondary" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Cargando bodega...</p>}
              {bodegaPreview && !loadingPreview && (
                <div style={{ marginTop: '1rem', background: 'var(--surface)', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>BODEGA SELECCIONADA</p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <InfoChip label="Ubicación" value={bodegaPreview.ubicacion} />
                    <InfoChip label="Capacidad" value={`${bodegaPreview.capacidadM3.toLocaleString('es-CO')} m³`} />
                    <InfoChip label="Libre" value={`${bodegaPreview.volumenLibreM3.toLocaleString('es-CO')} m³`} />
                    <InfoChip label="Zonas" value={`${zonasPreview.length}`} />
                    {form.fechaInicio && form.fechaFin && form.canonMensual && (
                      <InfoChip
                        label="Total estimado"
                        value={`$${(parseFloat(form.canonMensual) * mesesEntre(form.fechaInicio, form.fechaFin)).toLocaleString('es-CO')}`}
                        highlight
                      />
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" disabled={!puedeDescargarCotizacion} onClick={handleDescargarCotizacion}>
                  <Download size={15} /> Descargar Cotización PDF
                </button>
                <button className="btn btn-primary" disabled={!puedeDescargarCotizacion || creandoContrato} onClick={handleCrearContrato}>
                  {creandoContrato ? 'Creando...' : <><CheckCircle size={15} /> Crear Contrato</>}
                </button>
                <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={cerrarFlujo}>
                  <X size={15} /> Cancelar
                </button>
              </div>
            </>
          )}

          {/* ─── Step 2: Contrato creado ─── */}
          {flujoStep === 'contrato' && contratoCreado && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle size={48} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
                Contrato N° {String(contratoCreado.id).padStart(6, '0')} creado
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                La bodega <strong>{contratoCreado.bodegaNombre}</strong> está en estado{' '}
                <strong style={{ color: estadoColor['RESERVADA'] }}>RESERVADA</strong>.{' '}
                Descarga el contrato para que el cliente lo firme. Una vez confirmes el pago, la bodega pasará a <strong style={{ color: estadoColor['EN_USO'] }}>EN_USO</strong>.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleDescargarContrato}>
                  <Download size={15} /> Descargar Contrato para Firmar
                </button>
                <button className="btn btn-secondary" onClick={cerrarFlujo}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabla de contratos ── */}
      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
        </div>
      ) : (
        <div className="card mb-3">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Todos los contratos</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Cliente</th><th>Bodega</th><th>Estado bodega</th>
                  <th>Inicio</th><th>Fin</th><th>Canon</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contratos.length === 0 ? (
                  <tr><td colSpan={9} className="text-secondary" style={{ textAlign: 'center' }}>No hay contratos</td></tr>
                ) : contratos.map(c => {
                  const estadoBodega = bodegaEstado(c.bodegaId)
                  return (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.usuarioNombre || c.usuarioId}</td>
                      <td>{c.bodegaNombre || c.bodegaId}</td>
                      <td>
                        {estadoBodega && (
                          <span style={{ color: estadoColor[estadoBodega], fontWeight: 600, fontSize: '0.8rem' }}>
                            {estadoBodega}
                          </span>
                        )}
                      </td>
                      <td>{fmtDate(c.fechaInicio)}</td>
                      <td>{fmtDate(c.fechaFin)}</td>
                      <td>${Number(c.canonMensual).toLocaleString('es-CO')}</td>
                      <td>
                        <span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>
                          {c.activo ? 'Activo' : 'Terminado'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {estadoBodega === 'RESERVADA' && c.activo && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleValidarPago(c)}>
                              <CheckCircle size={13} /> Validar Pago
                            </button>
                          )}
                          {c.activo && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleTerminar(c.id)}>Terminar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Informe por Bodega ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <ClipboardList size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Informe por Bodega
          </h2>
          {detalle && (
            <button className="btn btn-primary" onClick={generarInformePDF}>
              <Download size={16} /> Generar PDF
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
          <select className="input" style={{ maxWidth: 320 }} value={selectedBodegaId}
            onChange={e => handleSeleccionarBodega(e.target.value)}>
            <option value="">Seleccionar bodega...</option>
            {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre} — {b.estado}</option>)}
          </select>
        </div>

        {loadingDetalle && <p className="text-secondary">Cargando información...</p>}

        {detalle && !loadingDetalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SectionBlock title="Información General">
              <div className="grid grid-2" style={{ gap: '0.75rem' }}>
                <InfoItem label="Ubicación" value={detalle.bodega.ubicacion} />
                <InfoItem label="Estado" value={<span style={{ color: estadoColor[detalle.bodega.estado], fontWeight: 600 }}>{detalle.bodega.estado}</span>} />
                <InfoItem label="Capacidad total" value={`${detalle.bodega.capacidadM3.toLocaleString('es-CO')} m³`} />
                <InfoItem label="Volumen ocupado" value={`${detalle.bodega.volumenOcupadoM3.toLocaleString('es-CO')} m³`} />
                <InfoItem label="Volumen libre" value={`${detalle.bodega.volumenLibreM3.toLocaleString('es-CO')} m³`} />
                <InfoItem label="% Ocupación" value={`${detalle.bodega.porcentajeOcupacion.toFixed(1)}%`} />
              </div>
              <OcupacionBar pct={detalle.bodega.porcentajeOcupacion} />
            </SectionBlock>

            <SectionBlock title={`Contratos (${detalle.contratos.length})`}>
              {detalle.contratos.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Sin contratos</p> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>ID</th><th>Cliente</th><th>Inicio</th><th>Fin</th><th>Canon</th><th>Estado</th></tr></thead>
                    <tbody>
                      {detalle.contratos.map(c => (
                        <tr key={c.id}>
                          <td>{c.id}</td><td>{c.usuarioNombre || c.usuarioId}</td>
                          <td>{fmtDate(c.fechaInicio)}</td><td>{fmtDate(c.fechaFin)}</td>
                          <td>${Number(c.canonMensual).toLocaleString('es-CO')}</td>
                          <td><span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>{c.activo ? 'Activo' : 'Terminado'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionBlock>

            <SectionBlock title={`Zonas (${detalle.zonas.length})`}>
              {detalle.zonas.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Sin zonas</p> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Zona</th><th>Capacidad</th><th>Ocupado</th><th>Libre</th><th>% Ocup.</th></tr></thead>
                    <tbody>
                      {detalle.zonas.map(z => (
                        <tr key={z.id}>
                          <td>{z.nombre}</td><td>{z.capacidadM3} m³</td>
                          <td>{z.volumenOcupadoM3} m³</td><td>{z.volumenLibreM3} m³</td>
                          <td>{z.porcentajeOcupacion.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionBlock>

            <SectionBlock title={`Inventario (${detalle.objetos.length} objetos)`}>
              {detalle.objetos.length === 0 ? <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Sin objetos</p> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Objeto</th><th>Categoría</th><th>Cantidad</th><th>Volumen (m³)</th></tr></thead>
                    <tbody>
                      {detalle.objetos.map(o => (
                        <tr key={o.id}>
                          <td>{o.nombre}</td><td>{o.categoriaNombre || '—'}</td>
                          <td>{o.cantidad}</td><td>{o.volumenTotalM3.toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionBlock>
          </div>
        )}

        {!selectedBodegaId && !loadingDetalle && (
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Selecciona una bodega para ver su información completa y generar un informe.
          </p>
        )}
      </div>
    </Layout>
  )
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function StepBadge({ n, label, active, done, muted }: { n: number; label: string; active: boolean; done: boolean; muted?: boolean }) {
  const bg = done ? '#22c55e' : active ? 'var(--primary)' : muted ? 'var(--border)' : 'var(--border)'
  const color = (done || active) ? '#fff' : 'var(--text-secondary)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: '0.7rem', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

function InfoChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--primary)' : undefined }}>{value}</div>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function OcupacionBar({ pct }: { pct: number }) {
  return (
    <div style={{ marginTop: '0.75rem', background: 'var(--border)', borderRadius: 4, height: 8 }}>
      <div style={{
        height: 8, borderRadius: 4, width: `${Math.min(pct, 100)}%`,
        background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e',
        transition: 'width 0.3s',
      }} />
    </div>
  )
}
