package com.vmmigration.dto;

import com.vmmigration.entity.Role;
import lombok.*;
import java.time.OffsetDateTime;

public class AuthDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JwtResponse {
        private String token;
        private String type;
        private Long id;
        private String username;
        private Role role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private Long id;
        private String username;
        private Role role;
        private OffsetDateTime createdAt;
    }
}
