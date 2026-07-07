package com.bitapp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Mapeia a tabela `od_flows` — fluxos de deslocamento entre clusters,
 * k-anonimizados (K=3). Seguros para uso público. Fonte:
 * trajetos_comuns.csv (506 pares).
 *
 * Ainda sem endpoint dedicado no MVP — ver docs/DATA_CONTRACT.md
 * secção 4.4 para uma query de referência sobre fluxos de saída.
 */
@Entity
@Table(name = "od_flows")
public class OdFlow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_origem_id", nullable = false)
    private Region regionOrigem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_destino_id", nullable = false)
    private Region regionDestino;

    @Column(name = "mesmo_cluster", nullable = false)
    private Boolean mesmoCluster;

    @Column(name = "n_usuarios", nullable = false)
    private Integer nUsuarios;

    @Column(name = "n_viagens", nullable = false)
    private Integer nViagens;

    @Column(name = "dist_media_km", precision = 8, scale = 3)
    private BigDecimal distMediaKm;

    @Column(name = "periodo_predominante")
    private String periodoPredominante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private Source source;

    public OdFlow() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Region getRegionOrigem() {
        return regionOrigem;
    }

    public void setRegionOrigem(Region regionOrigem) {
        this.regionOrigem = regionOrigem;
    }

    public Region getRegionDestino() {
        return regionDestino;
    }

    public void setRegionDestino(Region regionDestino) {
        this.regionDestino = regionDestino;
    }

    public Boolean getMesmoCluster() {
        return mesmoCluster;
    }

    public void setMesmoCluster(Boolean mesmoCluster) {
        this.mesmoCluster = mesmoCluster;
    }

    public Integer getNUsuarios() {
        return nUsuarios;
    }

    public void setNUsuarios(Integer nUsuarios) {
        this.nUsuarios = nUsuarios;
    }

    public Integer getNViagens() {
        return nViagens;
    }

    public void setNViagens(Integer nViagens) {
        this.nViagens = nViagens;
    }

    public BigDecimal getDistMediaKm() {
        return distMediaKm;
    }

    public void setDistMediaKm(BigDecimal distMediaKm) {
        this.distMediaKm = distMediaKm;
    }

    public String getPeriodoPredominante() {
        return periodoPredominante;
    }

    public void setPeriodoPredominante(String periodoPredominante) {
        this.periodoPredominante = periodoPredominante;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }
}
