package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByBodegaIdOrderByFechaMovimientoDesc(Long bodegaId);
    List<Movimiento> findByObjetoIdOrderByFechaMovimientoDesc(Long objetoId);
}
