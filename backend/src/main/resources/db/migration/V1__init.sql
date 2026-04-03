create table posts (
    id bigserial primary key,
    title varchar(150) not null,
    body text not null,
    category varchar(50) not null,
    is_required boolean not null default false,
    author varchar(100) not null,
    published_at timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table post_reads (
    id bigserial primary key,
    post_id bigint not null references posts(id) on delete cascade,
    reader_name varchar(100) not null,
    read_at timestamptz not null,
    constraint uq_post_reads_post_reader unique (post_id, reader_name)
);
