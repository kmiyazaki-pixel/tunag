package com.example.tunaglite.dto;

import java.time.OffsetDateTime;

public record PostResponse(
        Long id,
        String title,
        String body,
        String category,
        boolean required,
        String author,
        OffsetDateTime publishedAt,
        long readCount
) {}
