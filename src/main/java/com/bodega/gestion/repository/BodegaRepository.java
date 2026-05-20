package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Bodega;
import com.bodega.gestion.enums.EstadoBodega;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BodegaRepository extends JpaRepository<Bodega, Long> {
    List<Bodega> findByEstado(EstadoBodega estado);
}
