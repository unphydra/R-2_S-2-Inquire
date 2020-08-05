/* eslint-disable max-statements */
/* eslint-disable no-magic-numbers */
exports.up = function(knex) {
  return knex.transaction(async function(trx) {
    await trx.schema.dropTableIfExists('users');
    await trx.schema.dropTableIfExists('questions');
    await trx.schema.dropTableIfExists('answers');
    await trx.schema.dropTableIfExists('comments');
    await trx.schema.dropTableIfExists('tags');
    await trx.schema.dropTableIfExists('voteLog');
    await trx.schema.dropTableIfExists('questionTags');
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
  });
};

exports.down = async function(knex) {
  return knex.transaction(async function(trx) {
    await trx.schema.dropTableIfExists('users');
    await trx.schema.dropTableIfExists('questions');
    await trx.schema.dropTableIfExists('answers');
    await trx.schema.dropTableIfExists('comments');
    await trx.schema.dropTableIfExists('tags');
    await trx.schema.dropTableIfExists('voteLog');
    await trx.schema.dropTableIfExists('questionTags');
  });
};
