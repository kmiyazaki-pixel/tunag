package com.example.tunaglite.repository;

import com.example.tunaglite.entity.PostRead;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReadRepository extends JpaRepository<PostRead, Long> {
    long countByPostId(Long postId);
    Optional<PostRead> findByPostIdAndReaderName(Long postId, String readerName);
}
