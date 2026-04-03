package com.example.tunaglite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReadPostRequest(@NotBlank @Size(max = 100) String readerName) {}
