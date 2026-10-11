package com.vmmigration.exception;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private OffsetDateTime timestamp;
    private List<String> details;
}
