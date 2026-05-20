package com.bodega.gestion.repository;

import com.bodega.gestion.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByPropietarioIdOrPropietarioIsNull(UUID usuarioId);
}
