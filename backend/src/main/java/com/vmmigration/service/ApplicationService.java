package com.vmmigration.service;

import com.vmmigration.dto.ApplicationDtos.*;
import com.vmmigration.entity.Application;
import com.vmmigration.entity.Server;
import com.vmmigration.exception.DuplicateResourceException;
import com.vmmigration.exception.ResourceNotFoundException;
import com.vmmigration.mapper.ApplicationMapper;
import com.vmmigration.repository.ApplicationRepository;
import com.vmmigration.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ServerRepository serverRepository;
    private final ApplicationMapper applicationMapper;

    public List<ApplicationDto> getAllApplications() {
        List<Application> apps = applicationRepository.findAll();
        List<Server> servers = serverRepository.findAll();

        Map<String, Long> serverCountByApp = servers.stream()
                .filter(s -> s.getApplicationName() != null)
                .collect(Collectors.groupingBy(Server::getApplicationName, Collectors.counting()));

        return apps.stream()
                .map(app -> applicationMapper.toDto(app, serverCountByApp.getOrDefault(app.getName(), 0L)))
                .collect(Collectors.toList());
    }

    public ApplicationDto getApplicationById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + id));
        long count = serverRepository.findAll().stream()
                .filter(s -> app.getName().equals(s.getApplicationName()))
                .count();
        return applicationMapper.toDto(app, count);
    }

    @Transactional
    public ApplicationDto createApplication(ApplicationRequest request) {
        if (applicationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Application with name already exists: " + request.getName());
        }
        Application app = applicationMapper.toEntity(request);
        Application saved = applicationRepository.save(app);
        return applicationMapper.toDto(saved, 0L);
    }

    @Transactional
    public ApplicationDto updateApplication(Long id, ApplicationRequest request) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + id));

        app.setName(request.getName());
        app.setType(request.getType());
        app.setOwner(request.getOwner());
        app.setCriticality(request.getCriticality());
        app.setDowntimeRequirement(request.getDowntimeRequirement());
        if (request.getHardwareDependency() != null) app.setHardwareDependency(request.getHardwareDependency());
        if (request.getVirtualizationCompatible() != null) app.setVirtualizationCompatible(request.getVirtualizationCompatible());

        Application updated = applicationRepository.save(app);
        long count = serverRepository.findAll().stream()
                .filter(s -> updated.getName().equals(s.getApplicationName()))
                .count();
        return applicationMapper.toDto(updated, count);
    }

    @Transactional
    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with ID: " + id);
        }
        applicationRepository.deleteById(id);
    }
}
