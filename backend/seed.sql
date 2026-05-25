-- ============================================================
-- SEED DATA: bodega-gestion
-- Genera data diversa para todos los estados y características
-- ============================================================

-- ############################################################
-- 1. CATEGORIAS (4 nuevas, total 12)
-- ############################################################
INSERT INTO categorias (id, nombre, descripcion, usuario_id)
VALUES
  (9,  'Ropa y Textiles',       'Prendas de vestir, telas y accesorios textiles',              'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0'),
  (10, 'Productos Químicos',     'Limpieza, solventes y químicos industriales',                'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0'),
  (11, 'Repuestos Automotrices', 'Partes y accesorios para vehículos',                         'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (12, 'Equipos Médicos',        'Instrumentos y dispositivos de uso clínico y hospitalario',  'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0');

-- ############################################################
-- 2. BODEGAS (4 nuevas, total 12)
-- ############################################################
INSERT INTO bodegas (id, nombre, ubicacion, capacidad_m3, volumen_ocupado_m3, estado, descripcion)
VALUES
  (9,  'Bodega Refrigerada',     'Km 5 Vía Las Palmas, Rionegro',   800.000,   0.000,  'RESERVADA', 'Cámaras frigoríficas para alimentos perecederos y medicamentos.'),
  (10, 'Bodega Industrial Sur',  'Calle 50 # 25-80, Itagüí',       2000.000,  0.000,  'EN_USO',    'Nave industrial con puente grúa para carga pesada.'),
  (11, 'Centro Logístico',       'Autopista Norte Km 7, Rionegro',  3500.000,  0.000,  'LIBRE',     'Plataforma logística con muelles de carga.'),
  (12, 'Mini Bodega',            'Carrera 30 # 15-20, Medellín',     30.000,   0.000,  'RESERVADA', 'Bodega pequeña para almacenamiento temporal.');

-- ############################################################
-- 3. ZONAS (16 nuevas, total 35)
-- ############################################################
INSERT INTO zonas (id, nombre, descripcion, bodega_id, capacidad_m3, volumen_ocupado_m3, posicion_x, posicion_y, ancho, alto)
VALUES
  -- Bodega 6 (Test) - 2 zonas
  (20, 'Zona Única Test',     'Área de prueba unitaria',             6,  40.000, 0.000, 0, 0, 2, 2),
  (21, 'Zona Respaldo Test',  'Espacio secundario de prueba',        6,  60.000, 0.000, 2, 0, 2, 2),

  -- Bodega 7 (Almacenamiento Norte) - 3 zonas
  (22, 'Zona Fría',           'Estantería con control de temperatura',7,  50.000, 0.000, 0, 0, 3, 4),
  (23, 'Zona Seca',           'Almacenamiento de mercancía general', 7,  60.000, 0.000, 3, 0, 3, 4),
  (24, 'Zona Devoluciones',   'Área para mercancía en revisión',     7,  40.000, 0.000, 0, 4, 2, 2),

  -- Bodega 8 (Logística Sur) - 2 zonas
  (25, 'Zona Cross-Docking',  'Área de transferencia rápida',        8,  45.000, 0.000, 0, 0, 4, 3),
  (26, 'Zona Almacenaje',     'Racks para inventario estático',      8,  40.500, 0.000, 0, 3, 4, 3),

  -- Bodega 9 (Refrigerada) - 3 zonas
  (27, 'Cámara Fría 1',       'Temperatura controlada 2-8°C',        9, 250.000, 0.000, 0, 0, 2, 3),
  (28, 'Cámara Fría 2',       'Temperatura controlada -18°C',        9, 300.000, 0.000, 2, 0, 2, 3),
  (29, 'Zona Seca Anexa',     'Empaque y preparación de pedidos',    9, 250.000, 0.000, 0, 3, 4, 2),

  -- Bodega 10 (Industrial Sur) - 4 zonas
  (30, 'Zona Carga Pesada',   'Puente grúa para piezas industriales',10, 700.000, 0.000, 0, 0, 4, 4),
  (31, 'Zona Estantería Alta','Racks de 8 metros de altura',         10, 600.000, 0.000, 4, 0, 3, 4),
  (32, 'Zona Materiales',     'Almacén de insumos y materia prima',  10, 400.000, 0.000, 0, 4, 3, 3),
  (33, 'Zona Productos Term.','Productos listos para despacho',      10, 300.000, 0.000, 3, 4, 4, 3),

  -- Bodega 11 (Centro Logístico) - 3 zonas
  (34, 'Zona Recepción',      'Muelles de descarga y clasificación', 11, 800.000, 0.000, 0, 0, 5, 4),
  (35, 'Zona Almacén Picking','Zona optimizada para picking rápido', 11, 1500.000,0.000, 5, 0, 5, 5),
  (36, 'Zona Exportación',    'Almacenamiento para contenedores',    11, 1200.000,0.000, 0, 4, 5, 4),

  -- Bodega 12 (Mini Bodega) - 1 zona
  (37, 'Zona Única',          'Espacio único de almacenamiento',     12,  30.000, 0.000, 0, 0, 1, 1);

-- Actualizar todas las zonas existentes con coordenadas de grid correctas
-- (evita solapamiento: cada zona tiene posición y tamaño únicos dentro de su bodega)

-- Bodega 1 (Central): zonas 1 (A1), 2 (A2), 7 (A3), 12 (A4), 16 (Test)
UPDATE zonas SET posicion_x = 0, posicion_y = 0, ancho = 3, alto = 3 WHERE id = 1;
UPDATE zonas SET posicion_x = 3, posicion_y = 0, ancho = 3, alto = 3 WHERE id = 2;
UPDATE zonas SET posicion_x = 0, posicion_y = 3, ancho = 3, alto = 3 WHERE id = 7;
UPDATE zonas SET posicion_x = 3, posicion_y = 3, ancho = 3, alto = 3 WHERE id = 12;
UPDATE zonas SET posicion_x = 6, posicion_y = 0, ancho = 3, alto = 3 WHERE id = 16;

-- Bodega 2 (Norte): zonas 3 (B1), 8 (B2), 13 (B3), 19 (Unica Flujo)
UPDATE zonas SET posicion_x = 0, posicion_y = 0, ancho = 4, alto = 4 WHERE id = 3;
UPDATE zonas SET posicion_x = 4, posicion_y = 0, ancho = 4, alto = 4 WHERE id = 8;
UPDATE zonas SET posicion_x = 0, posicion_y = 4, ancho = 4, alto = 4 WHERE id = 13;
UPDATE zonas SET posicion_x = 0, posicion_y = 8, ancho = 6, alto = 6 WHERE id = 19;

-- Bodega 3 (Sur): zonas 4 (C1), 9 (C2), 14 (C3)
UPDATE zonas SET posicion_x = 0, posicion_y = 0, ancho = 4, alto = 4 WHERE id = 4;
UPDATE zonas SET posicion_x = 4, posicion_y = 0, ancho = 4, alto = 4 WHERE id = 9;
UPDATE zonas SET posicion_x = 0, posicion_y = 4, ancho = 4, alto = 4 WHERE id = 14;

-- Bodega 4 (Este): zonas 5 (D1), 10 (D2), 15 (D3)
UPDATE zonas SET posicion_x = 0, posicion_y = 0, ancho = 5, alto = 5 WHERE id = 5;
UPDATE zonas SET posicion_x = 5, posicion_y = 0, ancho = 5, alto = 5 WHERE id = 10;
UPDATE zonas SET posicion_x = 0, posicion_y = 5, ancho = 5, alto = 5 WHERE id = 15;

-- Bodega 5 (Oeste): zonas 6 (E1), 11 (E2)
UPDATE zonas SET posicion_x = 0, posicion_y = 0, ancho = 5, alto = 5 WHERE id = 6;
UPDATE zonas SET posicion_x = 0, posicion_y = 5, ancho = 5, alto = 5 WHERE id = 11;

-- ############################################################
-- 4. OBJETOS (33 nuevos, total 40)
-- ############################################################
INSERT INTO objetos (id, nombre, cantidad, largo_cm, ancho_cm, alto_cm, stock_minimo, categoria_id, bodega_id, zona_id, usuario_id)
VALUES
  -- Objetos en Bodega 1 (Central) - zonas A1, A2, A3
  (8,  'Teclados Mecánicos',          30,  45.00, 15.00,  4.00, 10, 1, 1, 1,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (9,  'Mouse Inalámbricos',          45,  12.00,  8.00,  4.00, 15, 1, 1, 1,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (10, 'Escritorios Metálicos',       12, 160.00, 80.00, 90.00,  3, 2, 1, 2,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (11, 'Archivadores Verticales',     20,  50.00, 45.00, 70.00,  5, 2, 1, 7,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (12, 'Laptop HP ProBook',           15,  35.00, 25.00,  3.00,  5, 1, 1, 1,  'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e'),

  -- Objetos en Bodega 2 (Norte)
  (13, 'Cajas Archivo Muerto',       200,  40.00, 30.00, 25.00, 50, 3, 2, 3,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (14, 'Cintas Adhesivas',           500,  10.00, 10.00,  5.00, 80, 3, 2, 19, 'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (15, 'Taladros Industriales',       10,  40.00, 30.00, 15.00,  2, 8, 2, 19, 'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e'),
  (16, 'Lijadoras Eléctricas',         8,  35.00, 25.00, 20.00,  3, 8, 2, 3,  'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e'),

  -- Objetos en Bodega 3 (Sur) - RESERVADA, ocupada por contrato activo
  (17, 'Materia Prima Textil',       300, 120.00, 50.00, 30.00, 100, 9, 3, 4,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (18, 'Hilos y Cierres',           1000,  20.00, 10.00,  5.00, 200, 9, 3, 9,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (19, 'Botones y Accesorios',      5000,   5.00,  3.00,  1.00, 800, 9, 3, 14, 'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),

  -- Objetos en Bodega 4 (Este) - LIBRE
  (20, 'Pintura Esmalte Blanca',     120,  25.00, 15.00, 15.00, 30, 10, 4, 5,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (21, 'Pintura Esmalte Negra',      100,  25.00, 15.00, 15.00, 30, 10, 4, 5,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (22, 'Pintura Esmalte Roja',        60,  25.00, 15.00, 15.00, 30, 10, 4, 10, 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),
  (23, 'Disolvente Industrial',       40,  30.00, 20.00, 15.00, 15, 10, 4, 10, 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'),

  -- Objetos en Bodega 5 (Oeste) - EN_USO
  (24, 'Amortiguadores Delanteros',   60,  50.00, 15.00, 15.00, 20, 11, 5, 6,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (25, 'Frenos de Disco',            150,  25.00, 20.00,  5.00, 40, 11, 5, 6,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (26, 'Bujías Encendido',          400,   5.00,  5.00,  5.00, 100, 11, 5, 11, 'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),
  (27, 'Aceite Motor 20W50',         200,  25.00, 10.00, 10.00, 50, 11, 5, 11, 'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d'),

  -- Objetos en Bodega 7 (Almacenamiento Norte) - BODEGA CON DESCRIPCION
  (28, 'Guantes de Nitrilo Caja',     80,  25.00, 12.00,  8.00, 20, 12, 7, 22, '13619411-1b65-4aa2-8e02-341ec3b09004'),
  (29, 'Jeringas 5ml (Caja 100u)',    50,  20.00, 15.00, 10.00, 15, 12, 7, 22, '13619411-1b65-4aa2-8e02-341ec3b09004'),
  (30, 'Vendas Elásticas (Paq 10)',  200,  15.00, 10.00,  5.00, 50, 12, 7, 23, '13619411-1b65-4aa2-8e02-341ec3b09004'),
  (31, 'Mascarillas Quirúrgicas',    500,  20.00, 12.00,  8.00, 100, 12, 7, 23, '13619411-1b65-4aa2-8e02-341ec3b09004'),

  -- Objetos en Bodega 9 (Refrigerada) - RESERVADA
  (32, 'Vacunas Antigripales',        200,  10.00,  8.00,  5.00, 50,  12, 9, 27, '13619411-1b65-4aa2-8e02-341ec3b09004'),
  (33, 'Insulina (Caja 10 viales)',    30,  15.00, 10.00,  8.00, 10,  12, 9, 27, '13619411-1b65-4aa2-8e02-341ec3b09004'),
  (34, 'Antibióticos (Caja 50 tabs)', 150,  12.00,  8.00,  5.00, 40,  12, 9, 27, '13619411-1b65-4aa2-8e02-341ec3b09004'),

  -- Objetos en Bodega 10 (Industrial Sur) - EN_USO
  (35, 'Vigas de Acero',              25, 600.00, 30.00, 20.00,  5,  4, 10, 30, 'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0'),
  (36, 'Planchas de Hierro',          40, 240.00,120.00,  0.50, 10,  4, 10, 30, 'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0'),
  (37, 'Tornillería surtida (kg)',   200,  30.00, 20.00, 15.00, 60,  4, 10, 31, 'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0'),
  (38, 'Cables Eléctricos (metro)',  500, 100.00,  5.00,  5.00, 100,  8, 10, 31, 'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e'),
  (39, 'Motores Eléctricos',          12,  80.00, 50.00, 50.00,  3,  8, 10, 32, 'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e'),
  (40, 'Cajas de Herramientas',       25,  60.00, 40.00, 30.00,  8,  8, 10, 32, 'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e');

-- ############################################################
-- 5. Calcular volúmenes ocupados de objetos y actualizar zonas/bodegas
-- ############################################################

-- Función auxiliar para calcular volumen total m3 de un objeto
-- Fórmula: (largo_cm * ancho_cm * alto_cm / 1000000) * cantidad
CREATE OR REPLACE FUNCTION fn_calcular_volumen_m3(p_largo_cm NUMERIC, p_ancho_cm NUMERIC, p_alto_cm NUMERIC, p_cantidad INTEGER)
RETURNS NUMERIC(10,3) AS $$
BEGIN
  RETURN ROUND((COALESCE(p_largo_cm, 0) * COALESCE(p_ancho_cm, 0) * COALESCE(p_alto_cm, 0) / 1000000.0) * p_cantidad, 3);
END;
$$ LANGUAGE plpgsql;

-- Actualizar volúmenes ocupados en zonas
UPDATE zonas z SET volumen_ocupado_m3 = (
  SELECT COALESCE(SUM(fn_calcular_volumen_m3(o.largo_cm, o.ancho_cm, o.alto_cm, o.cantidad)), 0)
  FROM objetos o WHERE o.zona_id = z.id
);

-- Actualizar volúmenes ocupados en bodegas
UPDATE bodegas b SET volumen_ocupado_m3 = (
  SELECT COALESCE(SUM(fn_calcular_volumen_m3(o.largo_cm, o.ancho_cm, o.alto_cm, o.cantidad)), 0)
  FROM objetos o WHERE o.bodega_id = b.id
);

DROP FUNCTION IF EXISTS fn_calcular_volumen_m3;

-- ############################################################
-- 6. CONTRATOS (6 nuevos, total 10)
-- ############################################################
INSERT INTO contratos (id, usuario_id, bodega_id, fecha_inicio, fecha_fin, canon_mensual, activo, url_documento)
VALUES
  (5,  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 4,  '2026-03-01', '2026-09-01',  800000.00,  true,  NULL),
  (6,  'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', 3,  '2026-05-15', '2027-05-15', 1200000.00,  true,  NULL),
  (7,  'f3a4b5c6-d7e8-4f9c-0d1e-2f3a4b5c6d7e', 5,  '2026-04-01', '2026-10-01', 1800000.00,  true,  NULL),
  (8,  'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', 5,  '2026-01-01', '2026-06-30', 1700000.00, false,  'https://supabase.storage/contratos/contrato_oeste_pepito.pdf'),
  (9,  'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', 9,  '2026-06-01', '2028-05-31', 3500000.00,  true,  NULL),
  (10, '13619411-1b65-4aa2-8e02-341ec3b09004',12, '2026-05-01', '2026-11-30',  500000.00,  true,  NULL);

-- ############################################################
-- 7. MOVIMIENTOS (52 nuevos, total 60)
-- ############################################################
INSERT INTO movimientos (id, tipo, objeto_id, bodega_id, cantidad, observaciones, registrado_por, fecha_movimiento)
VALUES
  -- Movimientos entrada varios
  (9,  'ENTRADA', 8,  1, 30, 'Ingreso de teclados mecánicos lote TEC-2026-01',                    'fa52afdf-7a2f-45f7-bbac-0ae9519a2ab6', '2026-05-10 09:30:00+00'),
  (10, 'ENTRADA', 9,  1, 45, 'Mouse inalámbricos marca LogiTech, lote MS-05/26',                 'fa52afdf-7a2f-45f7-bbac-0ae9519a2ab6', '2026-05-10 09:35:00+00'),
  (11, 'ENTRADA', 10, 1, 12, 'Escritorios metálicos color gris, pedido OFI-2026',                 'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-11 10:00:00+00'),
  (12, 'ENTRADA', 11, 1, 20, 'Archivadores metálicos 4 gavetas, lote ARCH-22',                   'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-11 10:15:00+00'),
  (13, 'ENTRADA', 12, 1, 15, 'Laptops HP ProBook 450 G10, lote HP-05/26',                       'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-12 08:00:00+00'),
  (14, 'ENTRADA', 13, 2, 200,'Cajas archivo muerto tamaño carta, 200 uds',                      'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-08 14:00:00+00'),
  (15, 'ENTRADA', 14, 2, 500,'Cinta adhesiva transparente 48mm x 100m, caja x 50u',             'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-08 14:30:00+00'),
  (16, 'ENTRADA', 15, 2, 10, 'Taladro percutor industrial 1/2", marca Bosch',                   'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-15 11:00:00+00'),
  (17, 'ENTRADA', 16, 2, 8,  'Lijadora orbital eléctrica 750W, marca DeWalt',                   'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-15 11:30:00+00'),
  (18, 'ENTRADA', 17, 3, 300,'Rollo de tela algodón premium, 150m c/u',                         'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-16 09:00:00+00'),
  (19, 'ENTRADA', 18, 3, 1000,'Hilo poliéster bobinas 500m,  surtido colores',                 'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-16 09:30:00+00'),
  (20, 'ENTRADA', 19, 3, 5000,'Botones plásticos 15mm, bolsa x 100u',                           'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-16 10:00:00+00'),
  (21, 'ENTRADA', 20, 4, 120,'Pintura esmalte blanca mate  1galón',                             'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '2026-05-18 08:00:00+00'),
  (22, 'ENTRADA', 21, 4, 100,'Pintura esmalte negra mate 1galón',                               'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '2026-05-18 08:30:00+00'),
  (23, 'ENTRADA', 22, 4, 60, 'Pintura esmalte roja mate 1galón',                                'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '2026-05-18 09:00:00+00'),
  (24, 'ENTRADA', 23, 4, 40, 'Disolvente industrial thinner 5galones',                          'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '2026-05-18 09:30:00+00'),
  (25, 'ENTRADA', 24, 5, 60, 'Amortiguadores delanteros Toyota Corolla 2025',                   'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-20 07:00:00+00'),
  (26, 'ENTRADA', 25, 5, 150,'Juego frenos disco delanteros estándar',                           'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-20 07:30:00+00'),
  (27, 'ENTRADA', 26, 5, 400,'Bujías de encendido NGK estándar, caja x 4u',                     'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-20 08:00:00+00'),
  (28, 'ENTRADA', 27, 5, 200,'Aceite motor 20W50 1galón, lote ACE-05/26',                       'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-20 08:30:00+00'),

  -- Movimientos salida
  (29, 'SALIDA',  8,  1,  5, 'Venta mostrador: 5 teclados mecánicos',                           'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-05-12 15:00:00+00'),
  (30, 'SALIDA',  9,  1, 10, 'Venta mayorista: 10 mouse inalámbricos',                          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-05-13 15:30:00+00'),
  (31, 'SALIDA',  10, 1,  2, 'Préstamo: 2 escritorios a oficina administrativa',                'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-14 09:00:00+00'),
  (32, 'SALIDA',  13, 2, 30, 'Despacho: 30 cajas archivo a oficina central',                    'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-10 16:00:00+00'),
  (33, 'SALIDA',  14, 2, 80, 'Despacho: 80 cintas adhesivas a almacén secundario',              'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-11 14:30:00+00'),
  (34, 'SALIDA',  17, 3, 50, 'Despacho: 50 rollos de tela a taller de confección',              'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-18 08:00:00+00'),
  (35, 'SALIDA',  18, 3, 200,'Despacho: 200 bobinas de hilo a producción',                      'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-18 08:30:00+00'),
  (36, 'SALIDA',  20, 4, 10, 'Venta: 10 galones pintura blanca a contratista',                  'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '2026-05-19 11:00:00+00'),
  (37, 'SALIDA',  24, 5,  5, 'Venta: 5 amortiguadores a taller automotriz',                     'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-22 10:00:00+00'),
  (38, 'SALIDA',  25, 5, 20, 'Venta: 20 juegos frenos a distribuidora repuestos',               'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-22 10:30:00+00'),
  (39, 'SALIDA',  27, 5, 30, 'Venta: 30 galones aceite 20W50 a lubricentro',                    'f2a3b4c5-d6e7-4f8b-9c0d-1e2f3a4b5c6d', '2026-05-22 11:00:00+00'),

  -- Más entradas recientes
  (40, 'ENTRADA', 28, 7, 80, 'Ingreso guantes nitrilo talla M, caja 100u',                       '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-23 08:00:00+00'),
  (41, 'ENTRADA', 29, 7, 50, 'Jeringas 5ml estériles caja x 100u',                              '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-23 08:30:00+00'),
  (42, 'ENTRADA', 30, 7, 200,'Vendas elásticas 10cm x 5m, paquete x 10u',                       '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-23 09:00:00+00'),
  (43, 'ENTRADA', 31, 7, 500,'Mascarillas quirúrgicas tri-capas caja x 50u',                     '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-23 09:30:00+00'),
  (44, 'ENTRADA', 32, 9, 200,'Vacuna antigripal tetravalente lote VAC-05/26',                   '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-24 06:00:00+00'),
  (45, 'ENTRADA', 33, 9, 30, 'Insulina humana NPH 100UI/ml caja 10 viales',                     '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-24 06:30:00+00'),
  (46, 'ENTRADA', 34, 9, 150,'Antibiótico Amoxicilina 500mg caja 50 tabs',                      '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-24 07:00:00+00'),
  (47, 'ENTRADA', 35, 10, 25,'Vigas de acero estructural IPN 200 x 12m',                        'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-20 06:00:00+00'),
  (48, 'ENTRADA', 36, 10, 40,'Plancha hierro negro 6mm 1.20x2.40m',                            'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-20 07:00:00+00'),
  (49, 'ENTRADA', 37, 10, 200,'Tornillería acero inoxidable M8 surtido kg',                     'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-20 08:00:00+00'),
  (50, 'ENTRADA', 38, 10, 500,'Cable eléctrico THW #12 (rollo 100m)',                           'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-21 10:00:00+00'),
  (51, 'ENTRADA', 39, 10, 12, 'Motor eléctrico trifásico 5HP 1800RPM',                          'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-21 11:00:00+00'),
  (52, 'ENTRADA', 40, 10, 25, 'Caja herramientas 155 piezas, marca Stanley',                     'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-21 12:00:00+00'),

  -- Salidas adicionales
  (53, 'SALIDA',  28, 7, 15, 'Despacho a hospital: 15 cajas guantes nitrilo',                   '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-24 14:00:00+00'),
  (54, 'SALIDA',  31, 7, 100,'Distribución a farmacia: 100 cajas mascarillas',                  '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-24 15:00:00+00'),
  (55, 'SALIDA',  32, 9, 20, 'Despacho a centro de salud: 20 dosis vacuna',                     '13619411-1b65-4aa2-8e02-341ec3b09004', '2026-05-25 08:00:00+00'),
  (56, 'SALIDA',  35, 10, 3, 'Salida a obra construcción: 3 vigas acero',                       'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-22 06:00:00+00'),
  (57, 'SALIDA',  36, 10, 5, 'Despacho taller metalmecánica: 5 planchas hierro',                'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-22 07:00:00+00'),
  (58, 'SALIDA',  37, 10, 25,'Venta: 25 kg tornillería a ferretería',                           'bbe6cdf2-6170-4274-ac1d-e28c6adf78e0', '2026-05-22 09:00:00+00'),
  (59, 'SALIDA',  38, 10, 80,'Salida a instalación eléctrica: 80m cable THW',                   'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-23 14:00:00+00'),
  (60, 'SALIDA',  39, 10, 2, 'Salida a mantenimiento industrial: 2 motores',                    'c9b81f3d-977e-4a29-a5f8-3c8d99cb666e', '2026-05-24 10:00:00+00');

-- ############################################################
-- 8. ACCESOS PERSONAS (19 nuevos, total 20)
-- ############################################################
INSERT INTO accesos_personas (id, nombre_persona, identificacion, bodega_id, hora_entrada, hora_salida, observaciones)
VALUES
  -- Personas que ya salieron (hora_salida presente)
  (2,  'Carlos Martínez',      'CC-98765432', 1, '2026-05-23 08:00:00+00', '2026-05-23 17:00:00+00','Proveedor de electrónicos'),
  (3,  'María Rodríguez',      'CC-12345678', 1, '2026-05-23 10:30:00+00', '2026-05-23 12:15:00+00','Auditoría de inventario'),
  (4,  'Pedro González',       'CC-56789123', 2, '2026-05-23 07:00:00+00', '2026-05-23 15:30:00+00','Descarga de mercancía'),
  (5,  'Ana Lucía López',      'CC-34567890', 2, '2026-05-22 09:00:00+00', '2026-05-22 16:45:00+00','Supervisión de personal'),
  (6,  'Jorge Hernández',      'CC-78901234', 3, '2026-05-24 06:30:00+00', '2026-05-24 14:00:00+00','Revisión de materia prima'),
  (7,  'Luisa Fernanda Ruiz',  'CC-23456789', 4, '2026-05-24 08:00:00+00', '2026-05-24 13:00:00+00','Toma física de inventario'),
  (8,  'Diego Alejandro Mora', 'CC-45678901', 5, '2026-05-24 07:30:00+00', '2026-05-24 18:00:00+00','Jornada completa de picking'),
  (9,  'Sofía Castro',         'CC-56789012', 1, '2026-05-25 08:00:00+00', '2026-05-25 12:00:00+00','Mantenimiento de sistemas'),
  (10, 'Ricardo Mendoza',      'CC-67890123', 7, '2026-05-25 09:00:00+00', '2026-05-25 11:30:00+00','Control de temperatura'),
  (11, 'Valentina Ospina',     'CC-78901235', 9, '2026-05-25 07:00:00+00', '2026-05-25 15:00:00+00','Supervisión cámara fría'),

  -- Personas aún dentro de las instalaciones (hora_salida NULL)
  (12, 'Camilo Andrés Torres', 'CC-89012346', 1, '2026-05-25 08:30:00+00', NULL, 'Instalación de estanterías'),
  (13, 'Daniela Giraldo',      'CC-90123457', 2, '2026-05-25 09:15:00+00', NULL, 'Inventario de papelería'),
  (14, 'Felipe Jaramillo',     'CC-01234568', 3, '2026-05-25 06:00:00+00', NULL, 'Turno de producción textil'),
  (15, 'Andrea Cardona',       'CC-11223344', 4, '2026-05-25 10:00:00+00', NULL, 'Revisión de químicos'),
  (16, 'Esteban Quintero',     'CC-22334455', 5, '2026-05-25 07:30:00+00', NULL, 'Despacho de repuestos'),
  (17, 'Natalia Restrepo',     'CC-33445566', 7, '2026-05-25 08:00:00+00', NULL, 'Alistamiento de pedidos médicos'),
  (18, 'Juan Pablo Londoño',   'CC-44556677', 9, '2026-05-25 06:30:00+00', NULL, 'Revisión de vacunas'),
  (19, 'Manuela Acevedo',      'CC-55667788', 10,'2026-05-25 07:00:00+00', NULL, 'Coordinación de carga pesada'),
  (20, 'Andrés Felipe Gil',    'CC-66778899', 10,'2026-05-25 08:00:00+00', NULL, 'Operador puente grúa');

-- ############################################################
-- 9. Actualizar secuencias para que los próximos IDs sean correctos
-- ############################################################
SELECT setval('bodegas_id_seq',        (SELECT MAX(id) FROM bodegas));
SELECT setval('zonas_id_seq',          (SELECT MAX(id) FROM zonas));
SELECT setval('categorias_id_seq',     (SELECT MAX(id) FROM categorias));
SELECT setval('objetos_id_seq',        (SELECT MAX(id) FROM objetos));
SELECT setval('contratos_id_seq',      (SELECT MAX(id) FROM contratos));
SELECT setval('movimientos_id_seq',    (SELECT MAX(id) FROM movimientos));
SELECT setval('accesos_personas_id_seq', (SELECT MAX(id) FROM accesos_personas));

-- ============================================================
-- FIN DEL SEED
-- ============================================================
