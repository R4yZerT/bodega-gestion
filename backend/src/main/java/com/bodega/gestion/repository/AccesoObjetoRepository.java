package com.bodega.gestion.repository;

import com.bodega.gestion.entity.AccesoObjeto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccesoObjetoRepository extends JpaRepository<AccesoObjeto, Long> {
    List<AccesoObjeto> findByAcceso_Id(Long accesoId);
}
