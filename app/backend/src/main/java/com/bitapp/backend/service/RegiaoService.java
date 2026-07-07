package com.bitapp.backend.service;

import com.bitapp.backend.dto.RegiaoDTO;
import com.bitapp.backend.entity.Region;
import com.bitapp.backend.repository.RegionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegiaoService {

    private final RegionRepository regionRepository;

    public RegiaoService(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    public List<RegiaoDTO> listarTodas() {
        return regionRepository.findAllByOrderByMunicipioAscClusterCodeAsc()
                .stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    private RegiaoDTO paraDTO(Region r) {
        boolean semCobertura = r.getLat() == null || r.getLng() == null;
        return new RegiaoDTO(r.getId(), r.getClusterCode(), r.getMunicipio(),
                r.getLat(), r.getLng(), semCobertura);
    }
}
