package com.bodega.gestion.service.impl;

import com.bodega.gestion.dto.request.ObjetoRequest;
import com.bodega.gestion.dto.response.ObjetoResponse;
import com.bodega.gestion.entity.*;
import com.bodega.gestion.exception.*;
import com.bodega.gestion.repository.*;
import com.bodega.gestion.service.ObjetoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ObjetoServiceImpl implements ObjetoService {

    private final ObjetoRepository objetoRepository;
    private final BodegaRepository bodegaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public ObjetoResponse crear(ObjetoRequest req, UUID usuarioId) {
        Bodega bodega = bodegaRepository.findById(req.getBodegaId())
                .orElseThrow(() -> new ResourceNotFoundException("Bodega no encontrada"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Objeto objeto = Objeto.builder()
                .nombre(req.getNombre())
                .cantidad(req.getCantidad())
                .largoCm(req.getLargoCm())
                .anchoCm(req.getAnchoCm())
                .altoCm(req.getAltoCm())
                .stockMinimo(req.getStockMinimo())
                .bodega(bodega)
                .propietario(usuario)
                .build();

        if (req.getCategoriaId() != null) {
            categoriaRepository.findById(req.getCategoriaId())
                    .ifPresent(objeto::setCategoria);
        }

        // RF-13: actualizar volumen ocupado en la bodega
        bodega.setVolumenOcupadoM3(
                bodega.getVolumenOcupadoM3().add(objeto.getVolumenTotalM3()));

        // Validar que no se exceda la capacidad (RF-09)
        if (bodega.getVolumenOcupadoM3().compareTo(bodega.getCapacidadM3()) > 0) {
            throw new BusinessException("La bodega no tiene suficiente espacio para estos objetos");
        }

        bodegaRepository.save(bodega);
        return ObjetoResponse.from(objetoRepository.save(objeto));
    }

    @Override
    public ObjetoResponse actualizar(Long id, ObjetoRequest req, UUID usuarioId) {
        Objeto objeto = objetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Objeto no encontrado"));

        // Revertir volumen anterior
        Bodega bodega = objeto.getBodega();
        bodega.setVolumenOcupadoM3(
                bodega.getVolumenOcupadoM3().subtract(objeto.getVolumenTotalM3()));

        objeto.setNombre(req.getNombre());
        objeto.setCantidad(req.getCantidad());
        objeto.setLargoCm(req.getLargoCm());
        objeto.setAnchoCm(req.getAnchoCm());
        objeto.setAltoCm(req.getAltoCm());
        objeto.setStockMinimo(req.getStockMinimo());

        // Aplicar nuevo volumen
        bodega.setVolumenOcupadoM3(
                bodega.getVolumenOcupadoM3().add(objeto.getVolumenTotalM3()));

        if (bodega.getVolumenOcupadoM3().compareTo(bodega.getCapacidadM3()) > 0) {
            throw new BusinessException("La bodega no tiene suficiente espacio");
        }

        bodegaRepository.save(bodega);
        return ObjetoResponse.from(objetoRepository.save(objeto));
    }

    @Override
    public void eliminar(Long id, UUID usuarioId) {
        Objeto objeto = objetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Objeto no encontrado"));
        Bodega bodega = objeto.getBodega();
        bodega.setVolumenOcupadoM3(
                bodega.getVolumenOcupadoM3().subtract(objeto.getVolumenTotalM3()));
        bodegaRepository.save(bodega);
        objetoRepository.delete(objeto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObjetoResponse> listarPorBodega(Long bodegaId) {
        return objetoRepository.findByBodegaId(bodegaId)
                .stream().map(ObjetoResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObjetoResponse> listarPorUsuario(UUID usuarioId) {
        return objetoRepository.findByPropietarioId(usuarioId)
                .stream().map(ObjetoResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ObjetoResponse> listarBajoStockMinimo(UUID usuarioId) {
        return objetoRepository.findObjetosBajoStockMinimo(usuarioId)
                .stream().map(ObjetoResponse::from).toList();
    }
}
