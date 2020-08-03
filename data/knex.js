const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './test.db',
  },
});

const users = knex('users').select();
const questions = knex('questions').select();
const answers = knex('answers').select();
const comments = knex('comments').select();
const voteLog = knex('voteLog').select();
const tags = knex.tag().select();
const questionTags = knex('questionTags').select();

const votes = voteLog.clone()
  .select('responseId as rId')
  .sum('vote as voteNo')
  .groupBy('responseId')
  .as('votes');

const answerCount = answers.clone()
  .select('questionId as qId')
  .count('id as no')
  .groupBy('questionId')
  .as('answerCount');

const acceptedAns = answers.clone()
  .select('isAccepted', 'questionId as qId')
  .where('isAccepted', '1')
  .as('acceptedAns');

const questionsColumn = [
  'id', 
  'ownerId', 
  'title', 
  'body', 
  'votes', 
  'no', 
  'isAccepted', 
  'receivedAt as rAt'
];

const getAllQuestions = questions.clone()
  .select(questionsColumn)
  .leftJoin(answerCount, 'id', 'answerCount.qId')
  .leftJoin(acceptedAns, 'id', 'acceptedAns.qid');

const handleRow = function(row) {
  
};

const insertTags = function(trx) {
  return ['node', 'python'].map(tag => {
    return trx.select().from('tags').where('title', tag).then(handleRow.bind(trx));
  });
};

knex.transaction(function(trx){
  return trx.insert({
    id: 'q00004',
    ownerId: 'u58027206',
    title: 'what is the most powerful thing in database?',
    body: 'i want to know it'
  })
    .into('questions')
    .then(function(){
      return insertTags(trx);
    });
}).then((r) => console.log('hello', r)).catch(err => console.log('err', err));
