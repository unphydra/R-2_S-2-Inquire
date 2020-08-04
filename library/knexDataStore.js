const knex = require('./knex');
const NestHydrationJs = require('nesthydrationjs')();

const users = knex('users').select();
const questions = knex('questions').select();
const answers = knex('answers').select();
const comments = knex('comments').select();
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
const answerVote = voteCount
  .clone()
  .where({type: 0})
  .as('aVote');
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

const allQuestionsData = questions
  .clone()
  .leftJoin( 
    users.clone().as('users'), 
    'ownerId', 
    'users.id' 
  )
  .leftJoin(
    answerCount.clone().as('ansCount'), 
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
  .orderBy('questions.receivedAt', 'desc');

const allComments = comments.clone()
  .select('comments.*', 'username')
  .leftJoin(
    users.clone().as('users'),
    'comments.ownerId',
    'users.id'
  )
  .as('allComments');

const allAnswers = answers.clone()
  .select(
    'answers.*', 
    'username', 'avatar', 
    'aVote.vote as votes'
  )
  .leftJoin(
    users.clone().as('users'),
    'answers.ownerId',
    'users.id'
  )
  .leftJoin(
    answerVote.clone().as('aVote'),
    'answers.id',
    'aVote.rId'
  )
  .orderBy('answers.modifiedAt', 'desc');

const allQuestionColumn = [
  'questions.id as qId',
  'questions.ownerId as qoId',
  'questions.title as qTitle',
  'questions.body as qBody',
  'questions.receivedAt as qrAt',
  'questions.modifiedAt as qmAt',
  'username', 
  'users.avatar', 
  'ansCount.count as ansCount', 
  'qVote.vote', 
  'qtt.title as tag',
  'acceptedAns.isAccepted as isAnsAccepted'
];
  
const definition = [{
  id: 'qId',
  ownerId: 'qoId',
  title: 'qTitle',
  body: 'qBody',
  receivedAt: 'qrAt',
  modifiedAt: 'qmAt',
  username: 'username',
  avatar: 'avatar',
  ansCount: 'ansCount',
  vote: 'vote',
  isAnsAccepted: [{isAnsAccepted: 'isAnsAccepted'}],
  tags: [{title: 'tag'}]
}];

const getAllQuestions = () => {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .then(data => NestHydrationJs.nest(data, definition));
};

const getUser = (id) => {
  return users.clone().where({id});
};

const addNewUser = (data) => {
  return users.clone().insert(data);
};

const getYourQuestions = (userId) => {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .where({ownerId: userId})
    .then(data => NestHydrationJs.nest(data, definition));
};

const getQuestionDetails = function(id) {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .where({'questions.id': id})
    .then(data => NestHydrationJs.nest(data, definition))
    .then(([question]) => {
      return allComments
        .clone()
        .where({'responseId': question.id, type: 1})
        .then(comments => {
          question.comments = comments;
          return question;
        });
    })
    .then(question => {
      return allAnswers.clone()
        .where('questionId', id)
        .then(answers => {
          return Promise.all(answers.map(answer => {
            return allComments
              .clone()
              .where({'responseId': answer.id, type: 0})
              .then(comments => {
                answer.comments = comments;
                return answer;
              });
          }));
        })
        .then(answers => {
          question.answers = answers;
          return question;
        });
    });
};

const allQuestionsYourAnswered = function(id) {
  definition['0'].isAnsAccepted = [{isAnsAccepted: 'isAccepted'}];
  return answers.clone()
    .join(
      allQuestionsData.clone().select(allQuestionColumn).as('aqd'),
      'answers.questionId',
      'aqd.qId'
    )
    .where('answers.ownerId', id)
    .then(data => NestHydrationJs.nest(data, definition));
};

module.exports = {
  getAllQuestions, 
  getUser, 
  addNewUser, 
  getYourQuestions,
  getQuestionDetails,
  allQuestionsYourAnswered
};
