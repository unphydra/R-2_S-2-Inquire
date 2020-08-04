DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users
(
  id INTEGER PRIMARY KEY,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerId INTEGER NOT NULL,
  title VARCHAR(30) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  receivedAt Date DEFAULT (datetime('now','localtime')),
  modifiedAt Date DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (ownerId)
  REFERENCES users(id)
);

DROP TABLE IF EXISTS answers;
CREATE TABLE IF NOT EXISTS answers
(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  questionId INTEGER NOT NULL,
  ownerId INTEGER NOT NULL,
  answer VARCHAR(1000) NOT NULL,
  receivedAt Date DEFAULT (datetime('now','localtime')),
  modifiedAt Date DEFAULT (datetime('now','localtime')),
  isAccepted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ownerId)
  REFERENCES users(id),
  FOREIGN KEY (questionId)
  REFERENCES questions(id)
);

DROP TABLE IF EXISTS comments;
CREATE TABLE IF NOT EXISTS comments
(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  responseId INTEGER NOT NULL,
  ownerId INTEGER NOT NULL,
  comment VARCHAR(400) NOT NULL,
  type INTEGER NOT NULL,
  receivedAt DATE DEFAULT (datetime('now','localtime')),
  modifiedAt DATE DEFAULT (datetime('now','localtime'))
  CHECK (type=1 OR type=0),
  FOREIGN KEY (ownerId)
  REFERENCES users(id)
);

DROP TABLE IF EXISTS voteLog;
CREATE TABLE IF NOT EXISTS voteLog
(
  ownerId INTEGER NOT NULL,
  responseId INTEGER NOT NULL,
  vote INTEGER NOT NULL,
  type INTEGER NOT NULL,
  PRIMARY KEY (ownerId,responseId,type),
  CHECK (type=1 OR type=0),
  CHECK (vote=1 OR vote=-1),
  FOREIGN KEY (ownerId)
  REFERENCES users(id)
);

DROP TABLE IF EXISTS tags;
CREATE TABLE IF NOT EXISTS tags
(
  id INTEGER PRIMARY KEY AUTOINCREMENT ,
  title VARCHAR(30)
);

DROP TABLE IF EXISTS questionTags;
CREATE TABLE IF NOT EXISTS questionTags
(
  questionId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  PRIMARY KEY (questionId,tagId),
  FOREIGN KEY (questionId)
  REFERENCES questions(id),
  FOREIGN KEY (tagId)
  REFERENCES tags(id)
);