package com.example.tunaglite.controller;

import com.example.tunaglite.dto.CreatePostRequest;
import com.example.tunaglite.dto.DashboardSummaryResponse;
import com.example.tunaglite.dto.PostResponse;
import com.example.tunaglite.dto.ReadPostRequest;
import com.example.tunaglite.service.PostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts")
    public List<PostResponse> getPosts() {
        return postService.getPosts();
    }

    @GetMapping("/posts/{id}")
    public PostResponse getPost(@PathVariable Long id) {
        return postService.getPost(id);
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(@Valid @RequestBody CreatePostRequest request) {
        return postService.createPost(request);
    }

    @PostMapping("/posts/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Long id, @Valid @RequestBody ReadPostRequest request) {
        postService.markRead(id, request.readerName());
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryResponse getSummary() {
        return postService.getSummary();
    }
}
