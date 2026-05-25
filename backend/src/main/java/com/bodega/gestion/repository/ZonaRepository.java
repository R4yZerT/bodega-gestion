package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ZonaRepository extends JpaRepository<Zona, Long> {
    List<Zona> findByBodegaId(Long bodegaId);
}