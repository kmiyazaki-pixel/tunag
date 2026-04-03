package com.example.tunaglite.repository;

import com.example.tunaglite.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
