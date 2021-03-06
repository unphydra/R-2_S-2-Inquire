const express = require('express');
const authRoute = express.Router();

const {
  checkOptions,
  serveQuestions,
  serveYourQuestionsPage,
  serveYourAnswersPage,
  serveYourTags,
  servePostQuestionPage,
  serveEditQuestionPage,
  registerNewUser,
  postQuestion,
  updateQuestion,
  postAnswer,
  updateAnswer,
  postComment,
  updateComment,
  acceptAnswer,
  updateVote,
  deleteComment,
  deleteAnswer
} = require('./handlers');

authRoute.get('/yourQuestions', serveYourQuestionsPage, serveQuestions);
authRoute.get('/yourAnswers', serveYourAnswersPage, serveQuestions);
authRoute.get('/yourTags', serveYourTags);
authRoute.get('/askQuestion', servePostQuestionPage);
authRoute.get('/editQuestion/:questionId', serveEditQuestionPage);

authRoute.post(
  '/newProfile', 
  [
    checkOptions(['name', String], ['username', String]), 
    registerNewUser
  ]
);
authRoute.post(
  '/postQuestion', 
  [
    checkOptions(['title', String], ['body', String], ['tags', Array]), 
    postQuestion
  ]
);
authRoute.post(
  '/updateQuestion/:questionId', 
  [
    checkOptions(['title', String], ['body', String], ['tags', Array]), 
    updateQuestion
  ]
);
authRoute.post(
  '/postAnswer',
  [checkOptions(['answer', String], ['questionId', Number]), postAnswer]
);
authRoute.post(
  '/updateAnswer', 
  [
    checkOptions(
      ['answer', String], ['answerId', Number], ['questionId', Number]
    ), 
    updateAnswer
  ]
);
authRoute.post(
  '/postComment', 
  [
    checkOptions(
      ['comment', String], 
      ['responseId', Number], 
      ['table', String]
    ), 
    postComment
  ]
);
authRoute.post(
  '/updateComment', 
  [
    checkOptions(['comment', String], ['commentId', Number]), 
    updateComment
  ]
);
authRoute.post(
  '/acceptAnswer', 
  [
    checkOptions(['qOwnerId', Number], ['answerId', Number]),
    acceptAnswer
  ]
);
authRoute.post(
  ['/upVote', '/downVote'],
  [checkOptions(['table', String], ['responseId', Number]), updateVote]
);
authRoute.post(
  '/deleteComment',
  [
    checkOptions(['commentId', Number]),
    deleteComment
  ]
);
authRoute.post(
  '/deleteAnswer',
  [
    checkOptions(['answerId', Number], ['questionId', Number]),
    deleteAnswer
  ]
);

module.exports = { authRoute };
