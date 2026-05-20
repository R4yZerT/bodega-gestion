package com.bodega.gestion.service.impl;

import com.bodega.gestion.dto.request.MovimientoRequest;
import com.bodega.gestion.dto.response.MovimientoResponse;
import com.bodega.gestion.entity.*;
import com.bodega.gestion.enums.TipoMovimiento;
import com.bodega.gestion.exception.*;
import com.bodega.gestion.repository.*;
import com.bodega.gestion.service.MovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MovimientoServiceImpl implements MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ObjetoRepository objetoRepository;
    private final BodegaRepository bodegaRepository;

    @Override
    public MovimientoResponse registrar(MovimientoRequest req, UUID registradoPor) {
        Objeto objeto = objetoRepository.findById(req.getObjetoId())
                .orElseThrow(() -> new ResourceNotFoundException("Objeto no encontrado"));

        Bodega bodega = objeto.getBodega();

        if (req.getTipo() == TipoMovimiento.ENTRADA) {
            // Verificar capacidad antes de ingresar
            var volumenNuevo = objeto.getVolumenTotalM3()
                    .multiply(java.math.BigDecimal.valueOf(req.getCantidad()))
                    .divide(java.math.BigDecimal.valueOf(
                            objeto.getCantidad() > 0 ? objeto.getCantidad() : 1));
            if (bodega.getVolumenOcupadoM3().add(volumenNuevo)
                    .compareTo(bodega.getCapacidadM3()) > 0) {
                throw new BusinessException("La bodega no tiene capacidad suficiente (RF-09)");
            }
            objeto.setCantidad(objeto.getCantidad() + req.getCantidad());
        } else {
            // SALIDA: verificar stock disponible
            if (objeto.getCantidad() < req.getCantidad()) {
                throw new BusinessException("Stock insuficiente. Disponible: " + objeto.getCantidad());
            }
            objeto.setCantidad(objeto.getCantidad() - req.getCantidad());
        }

        // Recalcular volumen de la bodega
        bodega.setVolumenOcupadoM3(
                objetoRepository.findByBodegaId(bodega.getId()).stream()
                        .map(Objeto::getVolumenTotalM3)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));

        objetoRepository.save(objeto);
        bodegaRepository.save(bodega);

        Movimiento movimiento = Movimiento.builder()
                .tipo(req.getTipo())
                .objeto(objeto)
                .bodega(bodega)
                .cantidad(req.getCantidad())
                .observaciones(req.getObservaciones())
                .registradoPor(registradoPor)
                .build();

        return MovimientoResponse.from(movimientoRepository.save(movimiento));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoResponse> listarPorBodega(Long bodegaId) {
        return movimientoRepository.findByBodegaIdOrderByFechaMovimientoDesc(bodegaId)
                .stream().map(MovimientoResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoResponse> listarPorObjeto(Long objetoId) {
        return movimientoRepository.findByObjetoIdOrderByFechaMovimientoDesc(objetoId)
                .stream().map(MovimientoResponse::from).toList();
    }
}
