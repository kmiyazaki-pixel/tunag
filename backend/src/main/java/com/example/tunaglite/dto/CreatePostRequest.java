package com.example.tunaglite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank String body,
        @NotBlank @Size(max = 50) String category,
        boolean required,
        @NotBlank @Size(max = 100) String author
) {}
