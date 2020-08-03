const {env} = process;
const {DbClient, DatabaseUrl} = env;

const knex = require('knex')({
  client: DbClient,
  connection: {
    filename: DatabaseUrl,
    timezone: 'utc'
  },
  useNullAsDefault: true
});

const NestHydrationJs = require('nesthydrationjs')();

const users = knex('users').select();
const questions = knex('questions').select();
const answers = knex('answers').select();
const voteLog = knex('voteLog').select();
const tags = knex('tags').select();
const questionTags = knex('questionTags').select();

const answerCount = answers
  .clone()
  .select('questionId as qId1')
  .count('id as count')
  .groupBy('questionId')
  .as('ansCount');
const voteCount = voteLog
  .clone()
  .select('responseId as rId', 'type')
  .sum('vote as vote')
  .groupBy('responseId', 'type')
  .as('votes');
const questionVote = voteCount
  .clone()
  .where({type: 1})
  .as('qVote');
const acceptedAnswer = answers
  .clone()
  .select('questionId as qId2', 'isAccepted')
  .where({isAccepted: 1})
  .as('acceptedAns');

const questionTagTitle = questionTags
  .clone()
  .select('questionId as qId3', 'title')
  .leftJoin(
    tags.clone().as('t'), 
    'tagId', 
    'id'
  )
  .as('questionTagTitle');

const getAllQuestions = () => {
  const allQuestionColumn = [
    'questions.*', 
    'users.username as ownerName', 
    'users.avatar', 
    'ansCount.count as ansCount', 
    'qVote.vote', 
    'acceptedAns.isAccepted as isAnsAccepted',
    'qtt.title as tag'
  ];
  
  const definition = [{
    id: 'id',
    ownerId: 'ownerId',
    title: 'title',
    body: 'body',
    receivedAt: 'receivedAt',
    modifiedAt: 'modifiedAt',
    ownerName: 'ownerName',
    avatar: 'avatar',
    ansCount: 'ansCount',
    vote: 'vote',
    isAnsAccepted: 'isAnsAccepted',
    tags: [{title: 'tag'}]
  }];

  return questions
    .clone()
    .select(allQuestionColumn)
    .leftJoin( users.clone().as('users'), 
      'ownerId', 
      'users.id' 
    )
    .leftJoin(answerCount.clone().as('ansCount'), 
      'questions.id', 
      'qId1'
    )
    .leftJoin(
      questionVote.clone().as('qVote'), 
      'questions.id', 
      'rId'
    )
    .leftJoin(
      acceptedAnswer.clone().as('acceptedAns'), 
      'questions.id', 
      'qId2'
    )
    .leftJoin(
      questionTagTitle.clone().as('qtt'),
      'questions.id',
      'qId3'
    )
    .then(data => NestHydrationJs.nest(data, definition));
};

module.exports = {knex, getAllQuestions};
