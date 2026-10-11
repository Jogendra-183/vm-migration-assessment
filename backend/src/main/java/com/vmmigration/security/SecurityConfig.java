package com.vmmigration.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/cloud/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Admin-only mutating endpoints
                .requestMatchers(HttpMethod.POST, "/api/servers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/servers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/servers/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/assessment/run").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/settings/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/migration-waves/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/migration-waves/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/migration-priority/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cloud/provisioning/requests").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cloud/provisioning/requests/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cloud/provisioning/requests/*/execute").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cloud/vms/*/start").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cloud/vms/*/stop").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/cloud/vms/**").hasRole("ADMIN")
                
                // All other authenticated endpoints (accessible by ADMIN & VIEWER)
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
