package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByBodegaIdOrderByFechaMovimientoDesc(Long bodegaId);
    List<Movimiento> findByObjetoIdOrderByFechaMovimientoDesc(Long objetoId);

    @Query("SELECT COUNT(m) FROM Movimiento m WHERE m.fechaMovimiento >= :start AND m.fechaMovimiento < :end")
    Long countToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
