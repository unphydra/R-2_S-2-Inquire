INSERT INTO users
VALUES
  ('u58026024', 'Rivu', 'unphydra', 'thoughtworks', 'rivu123@gmail.com', 'https://avatars3.githubusercontent.com/u/58026024?v=4', "hi i'm a developer"),
  ('u58027206', 'Satheesh', 'satheesh-chandran', 'thoughtworks', 'satheesh123@gmail.com', 'https://avatars3.githubusercontent.com/u/58027206?v=4', "hi i'm a developer too")
  ;

INSERT INTO questions(id,ownerId,title,body)
VALUES
  ('q00001','u58026024','what is sqlite?','i want to know about sqlite'),
  ('q00002','u58027206','what is the most powerful thing in database?', 'i want to know it')
  ;

INSERT INTO  answers(id,questionId,ownerId,answer)
VALUES
  ('a00001','q00001','u58027206','search it on google'),
  ('a00002','q00002','u58026024','database itself')
  ;

INSERT INTO comments(id,responseId,ownerId,comment)
VALUES
  ('c00001','q00001','u58027206','what you want to know'),
  ('c00002','a00002', 'u58026024','yes you are right')
  ;

INSERT INTO voteLog
VALUES
  ('u58027206','q00001',0),
  ('u58026024','a00002',1)
  ;

INSERT INTO tags
VALUES
  ('t00001','java'),
  ('t00002','javaScript'),
  ('t00003','node'),
  ('t00004','node-net')
  ;

INSERT INTO questionTags
VALUES
  ('q00001','t00001'),
  ('q00001','t00002'),
  ('q00001','t00003')
  ;

UPDATE questions
SET votes=votes-1
WHERE id='q00001'
;

UPDATE answers
SET votes=votes+1
WHERE id='a00002'
;