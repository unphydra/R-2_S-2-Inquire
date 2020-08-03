INSERT INTO users
VALUES
  (58026024, 'Rivu', 'unphydra', 'thoughtworks', 'rivu123@gmail.com', 'https://avatars3.githubusercontent.com/u/58026024?v=4', "hi i'm a developer"),
  (58027206, 'Satheesh', 'satheesh-chandran', 'thoughtworks', 'satheesh123@gmail.com', 'https://avatars3.githubusercontent.com/u/58027206?v=4', "hi i'm a developer too")
  ;

INSERT INTO questions(ownerId,title,body)
VALUES
  (58026024,'what is sqlite?','i want to know about sqlite'),
  (58027206,'what is the most powerful thing in database?', 'i want to know it')
  ;

INSERT INTO  answers(questionId,ownerId,answer)
VALUES
  (1,58027206,'search it on google'),
  (2,58026024,'database itself')
  ;

INSERT INTO comments(responseId,ownerId,comment,type)
VALUES
  (1,58027206,'what you want to know',1),
  (1,58026024,'yes you are right',0),
  (2,58027024,'It is wrong',1),
  (2,58029024,'you are wrong',0)
  ;

INSERT INTO voteLog
VALUES
  (58027206,1,1,1),
  (58027207,2,-1,1),
  (58027208,1,1,0),
  (58027209,2,-1,0),
  (58027210,1,1,1),
  (58026024,1,1,0)
  ;

INSERT INTO tags(title)
VALUES
  ('java'),
  ('javaScript'),
  ('node'),
  ('node-net')
  ;

INSERT INTO questionTags
VALUES
  (1,1),
  (1,2),
  (2,3)
  ;