// Edge Function: Validar capacidad volumétrica de una bodega
// Se ejecuta antes de registrar un movimiento o crear un objeto
// para verificar que no se exceda la capacidad de la bodega.

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
    const { bodegaId, volumenAdicional } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: bodega, error: bodegaError } = await supabaseClient
      .from('bodegas')
      .select('id, nombre, capacidad_m3, volumen_ocupado_m3, estado')
      .eq('id', bodegaId)
      .single()

    if (bodegaError) {
      return new Response(
        JSON.stringify({ error: 'Bodega no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const volumenLibre = bodega.capacidad_m3 - bodega.volumen_ocupado_m3
    const excede = volumenAdicional > volumenLibre

    return new Response(
      JSON.stringify({
        bodegaId: bodega.id,
        nombre: bodega.nombre,
        capacidadM3: bodega.capacidad_m3,
        volumenOcupadoM3: bodega.volumen_ocupado_m3,
        volumenLibreM3: volumenLibre,
        volumenAdicional,
        excedeCapacidad: excede,
        porcentajeOcupacion: ((bodega.volumen_ocupado_m3 + volumenAdicional) / bodega.capacidad_m3 * 100).toFixed(2),
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