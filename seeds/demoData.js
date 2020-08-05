
exports.seed = function(knex) {
  return knex.transaction(async function(trx) {
    await trx('users').insert([
      {
        id: 58026024, 
        name: 'Rivu', 
        username: 'unphydra', 
        company: 'thoughtworks', 
        email: 'rivu123@gmail.com', 
        avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4', 
        bio: 'hi i\'m a developer'
      }, 
      {
        id: 58027206, 
        name: 'Satheesh', 
        username: 'satheesh-chandran', 
        company: 'thoughtworks', 
        email: 'satheesh123@gmail.com', 
        avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4', 
        bio: 'hi i\'m a developer too'
      }
    ]);

    await trx('questions').insert([
      {
        ownerId: 58026024, 
        title: 'what is sqlite?', 
        body: 'i want to know about sqlite',
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        ownerId: 58027206,
        title: 'what is the most powerful thing in database?', 
        body: 'i want to know it',
        receivedAt: '2020-08-03 15:35:15',
        modifiedAt: '2020-08-03 15:35:15'
      }
    ]);

    await trx('answers').insert([
      {
        questionId: 1, 
        ownerId: 58027206, 
        answer: 'search it on google',
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        questionId: 2, 
        ownerId: 58026024, 
        answer: 'database itself', 
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        questionId: 2, 
        ownerId: 58026024, 
        answer: 'database itself 2nd', 
        receivedAt: '2020-08-03 15:35:15',
        modifiedAt: '2020-08-03 15:35:15',
        isAccepted: 1
      }
    ]);

    await trx('comments').insert([
      {
        responseId: 1, 
        ownerId: 58027206, 
        comment: 'what you want to know', 
        type: 1,
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        responseId: 1, 
        ownerId: 58026024, 
        comment: 'yes you are right', 
        type: 0,
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        responseId: 2, 
        ownerId: 58026024, 
        comment: 'It is wrong', 
        type: 1,
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        responseId: 2, 
        ownerId: 58027206, 
        comment: 'you are wrong', 
        type: 0,
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15'
      },
      {
        responseId: 2, 
        ownerId: 58027206, 
        comment: 'you are wrong 2nd', 
        type: 0,
        receivedAt: '2020-08-03 15:35:15',
        modifiedAt: '2020-08-03 15:35:15'
      }
    ]);

    await trx('voteLog').insert([
      {ownerId: 58027206, responseId: 1, vote: 1, type: 1},
      {ownerId: 58027207, responseId: 2, vote: -1, type: 1},
      {ownerId: 58027208, responseId: 1, vote: 1, type: 0},
      {ownerId: 58027209, responseId: 2, vote: -1, type: 0},
      {ownerId: 58027210, responseId: 1, vote: 1, type: 1},
      {ownerId: 58026024, responseId: 1, vote: 1, type: 0}
    ]);

    await trx('tags').insert([
      {title: 'java'},
      {title: 'javaScript'},
      {title: 'node'},
      {title: 'node-net'}
    ]);

    await trx('questionTags').insert([
      {questionId: 1, tagId: 1},
      {questionId: 1, tagId: 2},
      {questionId: 2, tagId: 3},
      {questionId: 2, tagId: 4}
    ]);
  });
};
