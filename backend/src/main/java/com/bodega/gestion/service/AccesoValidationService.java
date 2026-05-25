package com.bodega.gestion.service;

import com.bodega.gestion.dto.request.AccesoPersonaRequest;
import com.bodega.gestion.dto.request.SalidaRequest;
import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.entity.Objeto;
import com.bodega.gestion.exception.BusinessException;
import com.bodega.gestion.repository.BodegaRepository;
import com.bodega.gestion.repository.ObjetoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccesoValidationService {

    private final BodegaRepository bodegaRepository;
    private final ObjetoRepository objetoRepository;

    public void validarCapacidad(Long bodegaId, AccesoPersonaRequest request) {
        Bodega bodega = bodegaRepository.findById(bodegaId)
                .orElseThrow(() -> new BusinessException("Bodega no encontrada"));

        BigDecimal volumenLibre = bodega.getCapacidadM3().subtract(bodega.getVolumenOcupadoM3());
        BigDecimal volumenEntrante = BigDecimal.ZERO;

        for (var item : request.getItems()) {
            if (item.getObjetoId() == null || item.getCantidad() == null) continue;
            Objeto obj = objetoRepository.findById(item.getObjetoId()).orElse(null);
            if (obj == null) throw new BusinessException("Objeto no encontrado: " + item.getObjetoId());
            BigDecimal volumenUnitario = obj.getVolumenTotalM3()
                    .max(BigDecimal.ZERO);
            BigDecimal totalObjeto = obj.getCantidad() > 0
                    ? volumenUnitario.divide(BigDecimal.valueOf(obj.getCantidad()), 10, java.math.RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(item.getCantidad()))
                    : BigDecimal.ZERO;
            volumenEntrante = volumenEntrante.add(totalObjeto);
        }

        if (volumenEntrante.compareTo(volumenLibre) > 0) {
            throw new BusinessException(String.format(
                    "Capacidad insuficiente. Libre: %.2f m3. Requerido: %.2f m3. Exceso: %.2f m3",
                    volumenLibre, volumenEntrante, volumenEntrante.subtract(volumenLibre)));
        }
    }

    public void validarStock(SalidaRequest request) {
        for (var item : request.getItems()) {
            if (item.getObjetoId() == null || item.getCantidad() == null) continue;
            Objeto obj = objetoRepository.findById(item.getObjetoId())
                    .orElseThrow(() -> new BusinessException("Objeto no encontrado: " + item.getObjetoId()));
            if (obj.getCantidad() < item.getCantidad()) {
                throw new BusinessException(String.format(
                        "Stock insuficiente para '%s'. Disponible: %d. Intentas sacar: %d",
                        obj.getNombre(), obj.getCantidad(), item.getCantidad()));
            }
        }
    }
}
