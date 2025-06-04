CREATE TABLE users (
	id SERIAL,
	email VARCHAR(100),
	password VARCHAR(100)
);

CREATE TABLE posts (
	id SERIAL,
	title TEXT,
	content TEXT,
	date VARCHAR(20)
);

ALTER TABLE posts
ADD COLUMN city VARCHAR(50);

DELETE FROM posts
WHERE id != 1 AND id != 2;

