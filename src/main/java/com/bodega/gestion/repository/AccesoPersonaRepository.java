package com.bodega.gestion.repository;

import com.bodega.gestion.entity.AccesoPersona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccesoPersonaRepository extends JpaRepository<AccesoPersona, Long> {
    List<AccesoPersona> findByBodega_IdOrderByHoraEntradaDesc(Long bodegaId);
    List<AccesoPersona> findByIdentificacionOrderByHoraEntradaDesc(String identificacion);
}
