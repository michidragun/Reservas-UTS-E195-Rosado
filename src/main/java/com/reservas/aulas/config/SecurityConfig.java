package com.reservas.aulas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Permitir TODO por ahora para que funcione el login
                .anyRequest().permitAll()
            )
            // Desactiva el login form de Spring (usamos el nuestro con Firebase)
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable());

        return http.build();
    }
}