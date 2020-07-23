DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users
(
  id VARCHAR(30) PRIMARY KEY NOT NULL,
  name VARCHAR(30) NOT NULL,
  username VARCHAR(30) NOT NULL,
  company VARCHAR(30),
  email VARCHAR(50),
  avatar VARCHAR(100),
  bio VARCHAR(200)
);

DROP TABLE IF EXISTS questions;
CREATE TABLE IF NOT EXISTS questions
(
  id VARCHAR(30) PRIMARY KEY NOT NULL,
  ownerId VARCHAR(30) NOT NULL,
  title VARCHAR(30) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  votes NUMERIC(5) DEFAULT 0,
  recievedAt Date DEFAULT (datetime('now','localtime')),
  modifiedAt Date DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (ownerId)
  REFERENCES users(id)
);

DROP TABLE IF EXISTS answers;
CREATE TABLE IF NOT EXISTS answers
(
  id VARCHAR(30) PRIMARY KEY NOT NULL,
  questionId VARCHAR(30) NOT NULL,
  ownerId VARCHAR(30) NOT NULL,
  answer VARCHAR(1000) NOT NULL,
  recievedAt Date DEFAULT (datetime('now','localtime')),
  modifiedAt Date DEFAULT (datetime('now','localtime')),
  is_accepted BOOLEAN DEFAULT FALSE,
  votes NUMERIC(5) DEFAULT 0,
  FOREIGN KEY (ownerId)
  REFERENCES users(id),
  FOREIGN KEY (questionId)
  REFERENCES questions(id)
);

DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments
(
  id VARCHAR(15) PRIMARY KEY NOT NULL,
  responseId VARCHAR(30) NOT NULL,
  ownerId VARCHAR(30) NOT NULL,
  comment VARCHAR(400) NOT NULL,
  recievedAt Date DEFAULT (datetime('now','localtime'))
);

DROP TABLE IF EXISTS voteLog;
CREATE TABLE IF NOT EXISTS voteLog
(
  ownerId VARCHAR(30),
  responseId VARCHAR(30),
  vote BOOLEAN
);

DROP TABLE IF EXISTS tags;
CREATE TABLE IF NOT EXISTS tags
(
  id VARCHAR(30) UNIQUE,
  title VARCHAR(30)
);

DROP TABLE IF EXISTS questionTags;
CREATE TABLE IF NOT EXISTS questionTags
(
  questionId VARCHAR(10),
  tagId VARCHAR(30),
  FOREIGN KEY (questionId)
  REFERENCES questions(id),
  FOREIGN KEY (tagId)
  REFERENCES tags(id)
);