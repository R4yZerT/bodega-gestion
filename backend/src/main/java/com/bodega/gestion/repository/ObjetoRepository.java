package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Objeto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface ObjetoRepository extends JpaRepository<Objeto, Long> {
    List<Objeto> findByBodegaId(Long bodegaId);
    List<Objeto> findByPropietarioId(UUID usuarioId);

    // RF-08: objetos por debajo del stock mínimo
    @Query("SELECT o FROM Objeto o WHERE o.stockMinimo IS NOT NULL AND o.cantidad < o.stockMinimo AND o.propietario.id = :usuarioId")
    List<Objeto> findObjetosBajoStockMinimo(UUID usuarioId);

    @Query("SELECT o FROM Objeto o JOIN FETCH o.bodega ORDER BY (o.largoCm * o.anchoCm * o.altoCm * o.cantidad) DESC")
    List<Objeto> findTopByVolumen(Pageable pageable);
}
