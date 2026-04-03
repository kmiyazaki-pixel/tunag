package com.example.tunaglite.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "post_reads", uniqueConstraints = {
        @UniqueConstraint(name = "uq_post_reads_post_reader", columnNames = {"post_id", "reader_name"})
})
public class PostRead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "reader_name", nullable = false, length = 100)
    private String readerName;

    @Column(name = "read_at", nullable = false)
    private OffsetDateTime readAt;

    @PrePersist
    public void prePersist() {
        if (this.readAt == null) {
            this.readAt = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public String getReaderName() { return readerName; }
    public void setReaderName(String readerName) { this.readerName = readerName; }
    public OffsetDateTime getReadAt() { return readAt; }
}
