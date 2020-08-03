const dropTable = async function(trx) {
  await trx.schema.dropTableIfExists('users');
  await trx.schema.dropTableIfExists('questions');
  await trx.schema.dropTableIfExists('answers');
  await trx.schema.dropTableIfExists('comments');
  await trx.schema.dropTableIfExists('tags');
  await trx.schema.dropTableIfExists('voteLog');
  await trx.schema.dropTableIfExists('questionTags');
};

const createTable = async function(trx) {
  await trx.schema.createTable('users', function (table) {
    table.increments();
    table.string('name', 30).notNullable();
    table.string('username', 30).notNullable();
    table.string('company', 30);
    table.string('email', 50);
    table.string('avatar');
    table.string('bio');
  });

  await trx.schema.createTable('questions', function (table) {
    table.increments();
    table.integer('ownerId').notNullable();
    table.string('title').notNullable();
    table.string('body', 1000).notNullable();
    table.timestamp('receivedAt').defaultTo(trx.fn.now());
    table.timestamp('modifiedAt').defaultTo(trx.fn.now());
    table.foreign('ownerId').references('users.id');
  });

  await trx.schema.createTable('answers', function (table) {
    table.increments();
    table.integer('questionId').notNullable();
    table.integer('ownerId').notNullable();
    table.string('answer', 1000).notNullable();
    table.integer('isAccepted').defaultTo(0);
    table.timestamp('receivedAt').defaultTo(trx.fn.now());
    table.timestamp('modifiedAt').defaultTo(trx.fn.now());
    table.foreign('questionId').references('questions.id');
    table.foreign('ownerId').references('users.id');
  });

  await trx.schema.createTable('comments', function (table) {
    table.increments();
    table.integer('ownerId').notNullable();
    table.integer('responseId').notNullable();
    table.string('comment', 400).notNullable();
    table.integer('type').notNullable();
    table.timestamp('receivedAt').defaultTo(trx.fn.now());
    table.timestamp('modifiedAt').defaultTo(trx.fn.now());
    table.foreign('ownerId').references('users.id');
  });
  
  await trx.schema.createTable('voteLog', function (table) {
    table.integer('ownerId').notNullable();
    table.integer('responseId').notNullable();
    table.integer('vote').notNullable();
    table.integer('type').notNullable();
    table.primary(['ownerId', 'responseId', 'type']);
    table.foreign('ownerId').references('users.id');
  });

  await trx.schema.createTable('tags', function (table) {
    table.increments();
    table.string('title').unique();
  });

  await trx.schema.createTable('questionTags', function (table) {
    table.integer('questionId').notNullable();
    table.integer('tagId').notNullable();
    table.primary(['questionId', 'tagId']);
    table.foreign('questionId').references('questions.id');
    table.foreign('tagId').references('tags.id');
  });
};

const insertData = async function (trx) {
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
      receivedAt: '2020-08-03 15:31:15',
      modifiedAt: '2020-08-03 15:31:15'
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
      ownerId: 58027024, 
      comment: 'It is wrong', 
      type: 1,
      receivedAt: '2020-08-03 15:31:15',
      modifiedAt: '2020-08-03 15:31:15'
    },
    {
      responseId: 2, 
      ownerId: 58029024, 
      comment: 'you are wrong', 
      type: 0,
      receivedAt: '2020-08-03 15:31:15',
      modifiedAt: '2020-08-03 15:31:15'
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
    {questionId: 2, tagId: 3}
  ]);
};

module.exports = {
  dropTableTransaction: (knex) => knex.transaction(dropTable),
  createTableTransaction: (knex) => knex.transaction(createTable),
  insertDataTransaction: (knex) => knex.transaction(insertData),
};
