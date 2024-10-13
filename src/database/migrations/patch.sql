create table media_uploads (
    id int auto_increment primary key,
    filename varchar(255),
    filepath varchar(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
) engine=InnoDB;

alter table media_uploads
add column description text after filename

alter table media_uploads
add column title text after filename

alter table media_uploads
add column like_count int after description,
add column dislike_count int after like_count