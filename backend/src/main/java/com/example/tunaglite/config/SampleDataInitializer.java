package com.example.tunaglite.config;

import com.example.tunaglite.entity.Post;
import com.example.tunaglite.repository.PostRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleDataInitializer {
    @Bean
    CommandLineRunner initSampleData(PostRepository postRepository,
                                     @Value("${app.bootstrap-sample-data:true}") boolean bootstrapSampleData) {
        return args -> {
            if (!bootstrapSampleData || postRepository.count() > 0) {
                return;
            }

            postRepository.save(createPost("社内ポータル公開のお知らせ",
                    "TUNAG風の社内ポータルMVPです。重要なお知らせ、社内報、ナレッジ共有の起点として使ってください。",
                    "お知らせ", true, "管理部"));
            postRepository.save(createPost("4月の全社会議について",
                    "今月の全社会議は第2金曜日の18:00からです。事前に資料を確認してください。",
                    "社内報", true, "経営企画"));
            postRepository.save(createPost("ナレッジ共有: 引き継ぎで止まらないための3つのポイント",
                    "背景、担当、期限、依存関係を1画面で見えるようにしておくと引き継ぎの抜け漏れを減らせます。",
                    "ナレッジ", false, "開発部"));
        };
    }

    private Post createPost(String title, String body, String category, boolean required, String author) {
        Post post = new Post();
        post.setTitle(title);
        post.setBody(body);
        post.setCategory(category);
        post.setRequired(required);
        post.setAuthor(author);
        return post;
    }
}
