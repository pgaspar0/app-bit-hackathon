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

/**
 * Mapeia a tabela `subscriber_demographics` — perfil demográfico AGREGADO
 * por cluster. Nunca guarda assinantes individuais: os 200K registos de
 * assinantes.csv são agregados pelo pipeline em ~1.600 combinações de
 * (região, income_cluster, age_group, mobility_pattern).
 *
 * Ainda sem endpoint dedicado no MVP — pronta para os serviços de
 * Empregabilidade e Formação descritos na arquitectura do produto.
 */
@Entity
@Table(name = "subscriber_demographics")
public class SubscriberDemographic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(name = "income_cluster", nullable = false)
    private String incomeCluster;

    @Column(name = "age_group", nullable = false)
    private String ageGroup;

    @Column(name = "mobility_pattern", nullable = false)
    private String mobilityPattern;

    @Column(name = "subscriber_count", nullable = false)
    private Integer subscriberCount;

    @Column(name = "flagship_count", nullable = false)
    private Integer flagshipCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private Source source;

    public SubscriberDemographic() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public String getIncomeCluster() {
        return incomeCluster;
    }

    public void setIncomeCluster(String incomeCluster) {
        this.incomeCluster = incomeCluster;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getMobilityPattern() {
        return mobilityPattern;
    }

    public void setMobilityPattern(String mobilityPattern) {
        this.mobilityPattern = mobilityPattern;
    }

    public Integer getSubscriberCount() {
        return subscriberCount;
    }

    public void setSubscriberCount(Integer subscriberCount) {
        this.subscriberCount = subscriberCount;
    }

    public Integer getFlagshipCount() {
        return flagshipCount;
    }

    public void setFlagshipCount(Integer flagshipCount) {
        this.flagshipCount = flagshipCount;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }
}
