package com.bodega.gestion.service;

import com.bodega.gestion.dto.request.MovimientoRequest;
import com.bodega.gestion.dto.response.MovimientoResponse;
import java.util.List;
import java.util.UUID;

public interface MovimientoService {
    MovimientoResponse registrar(MovimientoRequest request, UUID registradoPor);
    List<MovimientoResponse> listarPorBodega(Long bodegaId);
    List<MovimientoResponse> listarPorObjeto(Long objetoId);
}
