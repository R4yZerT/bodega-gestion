package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {
    List<Contrato> findByUsuarioIdAndActivoTrue(UUID usuarioId);
    Optional<Contrato> findByBodegaIdAndActivoTrue(Long bodegaId);

    @Query("SELECT c FROM Contrato c JOIN FETCH c.usuario JOIN FETCH c.bodega")
    List<Contrato> findAllWithRelations();

    @Query("SELECT c FROM Contrato c JOIN FETCH c.usuario JOIN FETCH c.bodega WHERE c.activo = true AND c.fechaFin <= :fechaLimite")
    List<Contrato> findContratosProximosAVencer(LocalDate fechaLimite);

    @Query("SELECT c FROM Contrato c JOIN FETCH c.bodega JOIN FETCH c.usuario WHERE c.usuario.id = :usuarioId AND c.activo = true")
    List<Contrato> findMisContratosActivos(UUID usuarioId);

    @Query("SELECT COALESCE(SUM(c.canonMensual), 0) FROM Contrato c WHERE c.activo = true")
    BigDecimal sumCanonesActivos();

    @Query("SELECT COUNT(DISTINCT c.usuario.id) FROM Contrato c WHERE c.activo = true")
    Long countClientesActivos();
}