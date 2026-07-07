package com.bitapp.backend.service;

import com.bitapp.backend.dto.IndicadorDTO;
import com.bitapp.backend.repository.IndicatorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndicadorService {

    private final IndicatorRepository indicatorRepository;

    public IndicadorService(IndicatorRepository indicatorRepository) {
        this.indicatorRepository = indicatorRepository;
    }

    public List<IndicadorDTO> listarTodos() {
        return indicatorRepository.findAllByOrderByCategoryAscIndicatorNameAsc()
                .stream()
                .map(i -> new IndicadorDTO(
                        i.getIndicatorName(), i.getCategory(), i.getUnit(), i.getDescription()))
                .collect(Collectors.toList());
    }
}
