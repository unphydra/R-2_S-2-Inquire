class DataStore {
  constructor(db) {
    this.db = db;
  }

  async addNewUser({ id, avatar, name, username, email, company, bio }) {
    const query = `insert into users 
      values ("u${id}", "${name}", "${username}",
     "${company}", "${email}", "${avatar}", "${bio}")`;

    return new Promise((resolve, reject) => {
      this.db.run(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  findUser(id) {
    const query = `Select id from users where id='u${id}';`;
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async getAnswerAndVoteCount() {
    const query = `SELECT t1.id, t1.title, t1.votes, count(t2.id) as answers
                    FROM questions t1 LEFT JOIN answers t2 
                    ON t1.id = t2.questionId GROUP BY(t2.questionId)`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  async getTags() {
    const query = `SELECT t1.questionId, GROUP_CONCAT(t2.title) as tags
                    FROM questionTags t1 LEFT JOIN tags t2
                    ON t1.tagId = t2.id GROUP BY t1.questionId`;
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });
    });
  }

  async getAllQuestions() {
    const result = await this.getAnswerAndVoteCount();
    const tags = await this.getTags();
    tags.forEach((tag) => {
      result.forEach((question) => {
        if (tag.questionId === question.id) {
          question['tags'] = tag['tags'].split(',');
        }
      });
    });
    return result;
  }
}

module.exports = DataStore;
