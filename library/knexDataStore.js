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
  'type as type',
  'qtt.title as tag',
  'acceptedAns.isAccepted as isAnsAccepted'
];
  
const definition = (field) => [{
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
  isAnsAccepted: [{isAnsAccepted: field ? field : 'isAnsAccepted'}],
  tags: [{title: 'tag'}]
}];

const getAllQuestions = () => {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .then(data => NestHydrationJs.nest(data, definition()));
};

const getUser = (id = '0') => {
  return users.clone().where({id});
};

const addNewUser = (data) => {
  return users.clone().insert(data);
};

const getYourQuestions = (userId) => {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .where({ownerId: userId})
    .then(data => NestHydrationJs.nest(data, definition()));
};

const updateVoteDetails = (res, ownerId, responseId, type) =>
  voteLog
    .clone()
    .select('vote as voteType')
    .where({ ownerId, responseId, type: +type})
    .then(([voteDetails]) => {
      res.voteDetails = voteDetails || { voteType: 0 };
      return res;
    });

const includeComments = (res, responseId, type) =>
  allComments
    .clone()
    .where({responseId, type: +type})
    .then(comments => {
      res.comments = comments;
      return res;
    });

const getQuestionDetails = function (id, reqOwner = +'0') {
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .where({'questions.id': id})
    .then(data => NestHydrationJs.nest(data, definition()))
    .then(([question]) => checkIfError(question, 'no question found'))
    .then(question => updateVoteDetails(question, reqOwner, id, '1'))
    .then(question => includeComments(question, question.id, '1'))
    .then(question => {
      return allAnswers.clone()
        .where('questionId', id)
        .then(answers => {
          return Promise.all(answers.map(answer => 
            includeComments(answer, answer.id, '0')
              .then(ans => updateVoteDetails(ans, reqOwner, ans.id, '0'))
          ));
        })
        .then(answers => {
          question.answers = answers;
          return question;
        });
    });
};

const getYourQuestionDetails = function(qid, ownerId) {
  return allQuestionsData
    .clone()
    .select(allQuestionColumn)
    .where({'questions.id': qid, 'questions.ownerId': ownerId})
    .then(data => NestHydrationJs.nest(data, definition()));
};

const allQuestionsYouAnswered = function(id) {
  const currentDef = definition('isAccepted');
  return answers.clone()
    .join(
      allQuestionsData.clone().select(allQuestionColumn).as('aqd'),
      'answers.questionId',
      'aqd.qId'
    )
    .where('answers.ownerId', id)
    .then(data => NestHydrationJs.nest(data, currentDef));
};

const getYourTags = function(id){
  return allQuestionsData.clone()
    .select(allQuestionColumn)
    .where('qoId', id)
    .then(data => NestHydrationJs.nest(data, [{tags: [{title: 'tag'}]}]));
};

const getAllTags = function(){
  return tags.clone();
};

const tagInsertion = function(qId, tag){
  return this('tags')
    .select('id as tId')
    .where('title', tag)
    .then(([id]) => {
      if(id){
        return {questionId: qId, tagId: id.tId};
      }
      return this('tags')
        .insert({title: tag})
        .then(() => {
          return tagInsertion
            .bind(this, qId)(tag);
        });
    });
};

const insertNewQuestion = function(questionEntries, tags){
  let ID;
  return knex.transaction((trx) => 
    trx('questions')
      .insert(questionEntries)
      .then(() => {
        return trx('questions')
          .max('id as qId')
          .then(([id]) => {
            ID = id.qId;
          });
      })
      .then(() => {
        return Promise
          .all(tags
            .map(tagInsertion
              .bind(trx, ID)));
      })
      .then(qTagEntries => trx('questionTags')
        .insert(qTagEntries))
      .then(() => ID)
  );
};

const updateQuestion = function(questionEntries, tags){
  const {id, ownerId, title, body} = questionEntries;
  return knex.transaction((trx) => 
    trx('questions')
      .update({title, body})
      .where({id, ownerId})
      .then(row => checkIfError(row, 'no question found'))
      .then(() =>
        trx('questionTags')
          .del()
          .where({questionId: id})
      )
      .then(() => {
        return Promise
          .all(tags
            .map(tagInsertion
              .bind(trx, id)));
      })
      .then(qTagEntries => trx('questionTags')
        .insert(qTagEntries))
  );
};

const checkIfError = function(response, message) {
  if(response){
    return response;
  }
  throw new Error(message);
};

const insertNewAnswer = function(answerEntries) {
  const {questionId} = answerEntries;
  return knex.transaction((trx) =>
    trx('questions')
      .select()
      .where('id', questionId)
      .then(([question]) => checkIfError(question, 'no question found'))
      .then(() => 
        trx('answers')
          .insert(answerEntries)
      )
  );
};

const updateAnswer = function(answerEntries) {
  const {id, ownerId, answer} = answerEntries;
  return knex.transaction((trx) =>
    trx('answers')
      .select()
      .where({id, ownerId})
      .then(([response]) => checkIfError(response, 'no answer found'))
      .then(() => 
        trx('answers')
          .update({answer})
          .where({id, ownerId})
      )
  );
};

const getComment = (trx, id) =>
  trx('comments')
    .select('comments.*', 'username')
    .leftJoin(
      trx('users').as('users'),
      'comments.ownerId',
      'users.id'
    )
    .where('comments.id', id);

const insertNewComment = function(commentEntries, table) {
  const {responseId} = commentEntries;
  return knex.transaction((trx) =>
    trx(table)
      .select()
      .where('id', responseId)
      .then(([response]) => checkIfError(response, 'no response found'))
      .then(() => 
        trx('comments')
          .insert(commentEntries)
      )
      .then(([id]) => getComment(trx, id)));
};

const updateComment = function(commentEntries){
  const {id, ownerId, comment} = commentEntries;
  return knex.transaction((trx) =>
    trx('comments')
      .select()
      .where({id, ownerId})
      .then(([response]) => checkIfError(response, 'no comment found'))
      .then(() => 
        trx('comments')
          .update({comment})
          .where({id, ownerId})
      )
      .then(() => getComment(trx, id)));
};

const updateAcceptAnswer = function(entries, answerId, reqOwner) {
  return knex.transaction((trx) =>
    trx('answers')
      .select()
      .where('id', answerId)
      .then(([answer]) => checkIfError(answer, 'no answer found'))
      .then(answer =>
        trx('questions')
          .select()
          .where({id: answer.questionId, ownerId: reqOwner})
          .then(([question]) => checkIfError(question, 'no question found'))
      )
      .then(() => 
        trx('answers')
          .update(entries)
          .where('id', answerId)
      )
  );
};

const updateVote = function(entries, table){
  const {responseId, vote, type, ownerId} = entries;
  let currVote = 0;
  return knex.transaction((trx) =>
    trx(table)
      .select()
      .where('id', responseId)
      .then(([response]) => checkIfError(response, 'no response found'))
      .then(() => {
        return trx('voteLog')
          .select()
          .where({responseId, ownerId, type})
          .then(([logEntry]) => {
            if (!logEntry) {
              currVote = vote;
              return trx('voteLog').insert(entries);
            }
            if (logEntry.vote !== vote) {
              return trx('voteLog').del().where({responseId, type, ownerId});
            }
            currVote = logEntry.vote;
          });
      })
      .then(() =>
        trx('voteLog')
          .sum('vote as vote')
          .where({responseId, type})
      ).then(([data]) => {
        data.type = currVote;
        return data;
      })
  );
};

const deleteComment = function(entries) {
  return comments
    .clone()
    .del()
    .where(entries)
    .then(row => checkIfError(row, 'comment not found'));
};

const deleteAnswer = function(entries) {
  const criteria = {responseId: entries.id, type: 0};
  return knex.transaction((trx) => 
    trx('answers')
      .del()
      .where(entries)
      .then(row => checkIfError(row, 'answer not found'))
      .then(() =>
        trx('comments')
          .del()
          .where(criteria)
      )
      .then(() =>
        trx('voteLog')
          .del()
          .where(criteria)
      )
  );
};

module.exports = {
  getAllQuestions, 
  getUser, 
  addNewUser, 
  getYourQuestions,
  getYourQuestionDetails,
  getQuestionDetails,
  allQuestionsYouAnswered,
  getYourTags,
  getAllTags,
  insertNewQuestion,
  updateQuestion,
  insertNewAnswer,
  updateAnswer,
  insertNewComment,
  updateComment,
  updateAcceptAnswer,
  updateVote,
  deleteComment,
  deleteAnswer
};
