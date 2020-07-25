const dropTables = function(db) {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS users')
      .run('DROP TABLE IF EXISTS questions')
      .run('DROP TABLE IF EXISTS answers')
      .run('DROP TABLE IF EXISTS comments')
      .run('DROP TABLE IF EXISTS voteLog')
      .run('DROP TABLE IF EXISTS tags')
      .run('DROP TABLE IF EXISTS questionTags');
  });
};

const createTables = function(db) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users
    (
      id VARCHAR(30) PRIMARY KEY NOT NULL,
      name VARCHAR(30) NOT NULL,
      username VARCHAR(30) NOT NULL,
      company VARCHAR(30),
      email VARCHAR(50),
      avatar VARCHAR(100),
      bio VARCHAR(200)
    )`)
      .run(`CREATE TABLE IF NOT EXISTS questions
    (
      id VARCHAR(30) PRIMARY KEY NOT NULL,
      ownerId VARCHAR(30) NOT NULL,
      title VARCHAR(30) NOT NULL,
      body VARCHAR(1000) NOT NULL,
      votes NUMERIC(5) DEFAULT 0,
      receivedAt Date DEFAULT (datetime('now','localtime')),
      modifiedAt Date DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (ownerId)
      REFERENCES users(id)
    )`)
      .run(`CREATE TABLE IF NOT EXISTS answers
    (
      id VARCHAR(30) PRIMARY KEY NOT NULL,
      questionId VARCHAR(30) NOT NULL,
      ownerId VARCHAR(30) NOT NULL,
      answer VARCHAR(1000) NOT NULL,
      receivedAt Date DEFAULT (datetime('now','localtime')),
      modifiedAt Date DEFAULT (datetime('now','localtime')),
      is_accepted BOOLEAN DEFAULT FALSE,
      votes NUMERIC(5) DEFAULT 0,
      FOREIGN KEY (ownerId)
      REFERENCES users(id),
      FOREIGN KEY (questionId)
      REFERENCES questions(id)
    )`)
      .run(`CREATE TABLE IF NOT EXISTS comments
    (
      id VARCHAR(15) PRIMARY KEY NOT NULL,
      responseId VARCHAR(30) NOT NULL,
      ownerId VARCHAR(30) NOT NULL,
      comment VARCHAR(400) NOT NULL,
      receivedAt DATE NOT NULL DEFAULT (datetime('now','localtime'))
    )`)
      .run(`CREATE TABLE IF NOT EXISTS voteLog
    (
      ownerId VARCHAR(30),
      responseId VARCHAR(30),
      vote BOOLEAN,
      PRIMARY KEY (ownerId,responseId)
    )`)
      .run(`CREATE TABLE IF NOT EXISTS tags
    (
      id VARCHAR(30) UNIQUE,
      title VARCHAR(30)
    )`)
      .run(`CREATE TABLE IF NOT EXISTS questionTags
    (
      questionId VARCHAR(10),
      tagId VARCHAR(30),
      FOREIGN KEY (questionId)
      REFERENCES questions(id),
      FOREIGN KEY (tagId)
      REFERENCES tags(id)
    );`);
  });
};

const insertIntoTables = function(db) {
  db.serialize(() => {
    db.run(`INSERT INTO users
      VALUES
        (
          'u58026024',
          'Rivu', 
          'unphydra', 
          'thoughtworks', 
          'rivu123@gmail.com', 
          'https://avatars3.githubusercontent.com/u/58026024?v=4', 
          "hi i'm a developer"
        ),
        (
          'u58027206', 
          'Satheesh', 
          'satheesh-chandran', 
          'thoughtworks', 
          'satheesh123@gmail.com', 
          'https://avatars3.githubusercontent.com/u/58027206?v=4', 
          "hi i'm a developer too"
        )
      `)
      .run(`INSERT INTO questions(id,ownerId,title,body)
      VALUES
        ('q00001','u58026024','what is sqlite?','i want to know about sqlite'),
        (
          'q00002',
          'u58027206',
          'what is the most powerful thing in database?', 
          'i want to know it'
        )
      `)
      .run(`INSERT INTO  answers(id,questionId,ownerId,answer)
      VALUES
      ('a00001','q00001','u58027206','search it on google'),
      ('a00002','q00002','u58026024','database itself')
      `)
      .run(`INSERT INTO comments(id,responseId,ownerId,comment)
      VALUES
      ('c00001','q00001','u58027206','what you want to know'),
      ('c00002','a00002', 'u58026024','yes you are right')
      `)
      .run(`INSERT INTO voteLog
      VALUES
      ('u58027206','q00001',0),
      ('u58026024','a00002',1)
      `)
      .run(`INSERT INTO tags
      VALUES
      ('t00001','java'),
      ('t00002','javaScript'),
      ('t00003','node'),
      ('t00004','node-net')
      `)
      .run(`INSERT INTO questionTags
      VALUES
      ('q00001','t00001'),
      ('q00001','t00002'),
      ('q00002','t00003')
      `)
      .run(`UPDATE questions
      SET votes=votes-1
      WHERE id='q00001'
      `)
      .run(`UPDATE answers
      SET votes=votes+1
      WHERE id='a00002'
      `);
  });
};

module.exports = {dropTables, createTables, insertIntoTables};
