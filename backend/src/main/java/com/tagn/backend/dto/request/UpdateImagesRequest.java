package com.tagn.backend.dto.request;

import java.util.List;

public record UpdateImagesRequest(
        List<String> images
) {}
