package com.example.tunaglite.service;

import com.example.tunaglite.dto.CreatePostRequest;
import com.example.tunaglite.dto.DashboardSummaryResponse;
import com.example.tunaglite.dto.PostResponse;
import com.example.tunaglite.entity.Post;
import com.example.tunaglite.entity.PostRead;
import com.example.tunaglite.repository.PostReadRepository;
import com.example.tunaglite.repository.PostRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final PostReadRepository postReadRepository;

    public PostService(PostRepository postRepository, PostReadRepository postReadRepository) {
        this.postRepository = postRepository;
        this.postReadRepository = postReadRepository;
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPosts() {
        return postRepository.findAll().stream()
                .sorted(Comparator.comparing(Post::getPublishedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post not found: " + id));
        return toResponse(post);
    }

    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        Post post = new Post();
        post.setTitle(request.title());
        post.setBody(request.body());
        post.setCategory(request.category());
        post.setRequired(request.required());
        post.setAuthor(request.author());
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public void markRead(Long postId, String readerName) {
        postRepository.findById(postId).orElseThrow(() -> new EntityNotFoundException("Post not found: " + postId));
        if (postReadRepository.findByPostIdAndReaderName(postId, readerName).isPresent()) {
            return;
        }
        PostRead read = new PostRead();
        read.setPost(postRepository.getReferenceById(postId));
        read.setReaderName(readerName);
        postReadRepository.save(read);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        long totalPosts = postRepository.count();
        long requiredPosts = postRepository.findAll().stream().filter(Post::isRequired).count();
        long totalReads = postReadRepository.count();
        return new DashboardSummaryResponse(totalPosts, requiredPosts, totalReads);
    }

    private PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getBody(),
                post.getCategory(),
                post.isRequired(),
                post.getAuthor(),
                post.getPublishedAt(),
                postReadRepository.countByPostId(post.getId())
        );
    }
}
