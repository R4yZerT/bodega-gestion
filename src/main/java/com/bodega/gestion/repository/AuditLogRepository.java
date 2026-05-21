package com.bodega.gestion.repository;

import com.bodega.gestion.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTablaOrderByCreatedAtDesc(String tabla);
    List<AuditLog> findByUsuarioIdOrderByCreatedAtDesc(UUID usuarioId);
    List<AuditLog> findAllByOrderByCreatedAtDesc();
}