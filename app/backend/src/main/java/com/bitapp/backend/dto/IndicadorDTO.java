package com.bitapp.backend.dto;

/**
 * Resposta de GET /indicadores. indicatorName -> indicator_name via
 * Jackson SNAKE_CASE global.
 */
public class IndicadorDTO {

    private String indicatorName;
    private String category;
    private String unit;
    private String description;

    public IndicadorDTO() {
    }

    public IndicadorDTO(String indicatorName, String category, String unit, String description) {
        this.indicatorName = indicatorName;
        this.category = category;
        this.unit = unit;
        this.description = description;
    }

    public String getIndicatorName() {
        return indicatorName;
    }

    public void setIndicatorName(String indicatorName) {
        this.indicatorName = indicatorName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
