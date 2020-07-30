const ZERO = 0;
const ONE = 1;
const FIVE = 5;

const parseInteger = function (source) {
  return source ? +source.slice(ONE) : ZERO;
};

class DataStore {
  constructor(db) {
    this.db = db;
  }

  async executeQuery(query) {
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  async getQuery(query) {
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  async addNewUser({ id, avatar, name, username, email, company, bio }) {
    const query = `insert into users 
      values ("u${id}", "${name}", "${username}",
     "${company}", "${email}", "${avatar}", "${bio}")`;
    return this.executeQuery(query);
  }

  findUser(id) {
    const query = `Select * from users where id='u${id}';`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async getAllQuestions() {
    const query1 = `SELECT t1.id, t1.title, t1.votes, count(t2.id) as answers
                    FROM questions t1 LEFT JOIN answers t2 
                    ON t1.id = t2.questionId GROUP BY(t1.id)`;
    const query2 = `SELECT t1.questionId, GROUP_CONCAT(t2.title) as tags
                    FROM questionTags t1 LEFT JOIN tags t2
                    ON t1.tagId = t2.id GROUP BY t1.questionId`;

    const result = await this.executeQuery(query1);
    const tags = await this.executeQuery(query2);
    tags.forEach((tag) => {
      result.forEach((question) => {
        if (tag.questionId === question.id) {
          question['tags'] = tag['tags'] && tag['tags'].split(',');
        }
      });
    });
    return result;
  }

  async getComments(responseId) {
    const query = `select t1.*, t2.username 
                    from comments t1 join users t2
                    on t1.ownerId=t2.id 
                    where responseId="${responseId}"`;
    return this.executeQuery(query);
  }

  async getAnswers(questionId) {
    const query = `select *
                    from answers where questionId="${questionId}"`;
    const answers = await this.executeQuery(query);
    for (let index = 0; index < answers.length; index++) {
      answers[index].comments = await this.getComments(answers[index].id);
    }
    return answers;
  }

  async getRow(table, id) {
    const query = `select * from ${table} where id="${id}"`;
    return await this.getQuery(query);
  }

  async getQuestionDetails(id) {
    const query1 = `select * from questions where id="${id}"`;
    const query2 = `select t2.title
                    from questionTags t1 join tags t2
                    on t1.tagId = t2.id 
                    where t1.questionId="${id}"`;
    try {
      const [result] = await this.executeQuery(query1);
      result.tags = await this.executeQuery(query2);
      result.comments = await this.getComments(id);
      result.answers = await this.getAnswers(id);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async fetchIds(table) {
    const query = `SELECT MAX (id) as id from ${table};`;
    const row = await this.getQuery(query);
    const id = parseInteger(row.id);
    return id;
  }

  async getTagId(tag) {
    const query = `SELECT id FROM tags WHERE title = '${tag}';`;
    let tagId = await this.getQuery(query);
    if (!tagId) {
      let id = await this.fetchIds('tags');
      tagId = { id: 't' + `${++id}`.padStart(FIVE, ZERO) };
      const insertTag = `insert into tags values ('${tagId.id}', '${tag}')`;
      await this.executeQuery(insertTag);
    }
    return tagId.id;
  }

  async insertTags(questionId, tags) {
    const tagIds = [];
    for(let index = 0; index < tags.length; index++){
      const id = await this.getTagId(tags[index]);
      const insertQuestionTag = `insert into questionTags 
                                  values ('${questionId}', '${id}')`;
      await this.executeQuery(insertQuestionTag);
      tagIds.push(id);
    }
    return tagIds;
  }

  async insertQuestion(owner, title, body) {
    let id = await this.fetchIds('questions');
    const currentId = `${++id}`.padStart(FIVE, ZERO);
    const insertQuery = `INSERT INTO questions(id, ownerId, title, body)
                  VALUES ('q${currentId}', 'u${owner}', '${title}', '${body}')`;
    await this.executeQuery(insertQuery);
    return `q${currentId}`;
  }

  async insertAnswer(questionId, ownerId, answer) {
    let id = await this.fetchIds('answers');
    const currentId = `${++id}`.padStart(FIVE, ZERO);
    const insertQuery = `INSERT INTO  answers(id,questionId,ownerId,answer)
            VALUES ('a${currentId}','${questionId}','${ownerId}','${answer}')`;
    await this.executeQuery(insertQuery);
    return `a${currentId}`;
  }

  async saveComment(ownerId, responseId, comment) {
    let id = await this.fetchIds('comments');
    const currentId = `${++id}`.padStart(FIVE, ZERO);
    const insertQuery = `INSERT INTO comments(id,responseId,ownerId,comment)
            VALUES('c${currentId}','${responseId}','u${ownerId}','${comment}')`;
    await this.executeQuery(insertQuery);
    return `c${currentId}`;
  }
}

module.exports = DataStore;
