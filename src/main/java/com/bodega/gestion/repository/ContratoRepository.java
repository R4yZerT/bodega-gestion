package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}