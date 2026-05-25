package com.bodega.gestion.service;

import com.bodega.gestion.dto.request.ObjetoRequest;
import com.bodega.gestion.dto.response.ObjetoResponse;
import java.util.List;
import java.util.UUID;

public interface ObjetoService {
    ObjetoResponse crear(ObjetoRequest request, UUID usuarioId);
    ObjetoResponse actualizar(Long id, ObjetoRequest request, UUID usuarioId);
    void eliminar(Long id, UUID usuarioId);
    List<ObjetoResponse> listarPorBodega(Long bodegaId);
    List<ObjetoResponse> listarPorUsuario(UUID usuarioId);
    List<ObjetoResponse> listarBajoStockMinimo(UUID usuarioId);
}
