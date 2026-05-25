package com.bodega.gestion.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class SalidaRequest {
    private List<ItemSalida> items = new ArrayList<>();

    @Data
    public static class ItemSalida {
        @NotNull(message = "El objeto es obligatorio")
        private Long objetoId;

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer cantidad;
    }
}
