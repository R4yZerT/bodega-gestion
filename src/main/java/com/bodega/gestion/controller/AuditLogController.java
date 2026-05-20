package com.bodega.gestion.controller;

import com.bodega.gestion.entity.AuditLog;
import com.bodega.gestion.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<AuditLog> listarTodos() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/tabla/{tabla}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<AuditLog> porTabla(@PathVariable String tabla) {
        return auditLogRepository.findByTablaOrderByCreatedAtDesc(tabla);
    }
}