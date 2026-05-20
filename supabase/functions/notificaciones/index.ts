// Edge Function: Notificaciones de stock mínimo y ocupación
// Se ejecuta vía cron o webhook para enviar alertas

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Objetos bajo stock mínimo
    const { data: objetosBajoStock, error: objError } = await supabaseClient
      .from('objetos')
      .select('id, nombre, cantidad, stock_minimo, usuario_id, bodegas(nombre)')
      .not('stock_minimo', 'is', null)
      .filter('cantidad', 'lte', supabaseClient.rpc('qualify', { col: 'stock_minimo' }))

    // Bodegas con ocupación > 80%
    const { data: bodegasAlerta, error: bodError } = await supabaseClient
      .from('bodegas')
      .select('id, nombre, capacidad_m3, volumen_ocupado_m3')
      .gt('volumen_ocupado_m3', 0)

    const bodegasAltoOcupacion = (bodegasAlerta || []).filter((b: any) => {
      const pct = (b.volumen_ocupado_m3 / b.capacidad_m3) * 100
      return pct >= 80
    })

    // Contratos próximos a vencer (30 días)
    const { data: contratosPorVencer } = await supabaseClient
      .from('contratos')
      .select('id, fecha_fin, usuarios(email, nombre_completo), bodegas(nombre)')
      .eq('activo', true)
      .lt('fecha_fin', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

    return new Response(
      JSON.stringify({
        objetosBajoStock: objetosBajoStock || [],
        bodegasAltoOcupacion,
        contratosPorVencer: contratosPorVencer || [],
        generadoEn: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})