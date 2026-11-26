package com.tagn.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Slf4j
@Configuration
public class DatabaseConstraintFixConfig {

    @Bean
    ApplicationRunner fixAppointmentEnumConstraints(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check");
                jdbcTemplate.execute(
                        "ALTER TABLE appointments ADD CONSTRAINT appointments_status_check " +
                        "CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'))"
                );
                jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_specialty_check");
                jdbcTemplate.execute(
                        "ALTER TABLE appointments ADD CONSTRAINT appointments_specialty_check " +
                        "CHECK (specialty IN ('ODONTOLOGIA', 'HARMONIZACAO', 'CLAREAMENTO', 'PREENCHIMENTO_LABIAL', 'BOTOX', 'BICHECTOMIA'))"
                );
            } catch (Exception ex) {
                log.warn("Could not update appointments check constraints: {}", ex.getMessage());
            }
        };
    }
}
