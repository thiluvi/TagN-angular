package com.tagn.backend.repository;

import com.tagn.backend.domain.entity.PasswordResetCode;
import com.tagn.backend.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, UUID> {

    Optional<PasswordResetCode> findTopByUserAndCodeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            User user, String code, LocalDateTime now
    );

    void deleteByUser(User user);
}
