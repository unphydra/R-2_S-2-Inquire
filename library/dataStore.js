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
                    ON t1.id = t2.questionId GROUP BY(t2.questionId)`;
    const query2 = `SELECT t1.questionId, GROUP_CONCAT(t2.title) as tags
                    FROM questionTags t1 LEFT JOIN tags t2
                    ON t1.tagId = t2.id GROUP BY t1.questionId`;

    const result = await this.executeQuery(query1);
    const tags = await this.executeQuery(query2);
    tags.forEach((tag) => {
      result.forEach((question) => {
        if (tag.questionId === question.id) {
          question['tags'] = tag['tags'].split(',');
        }
      });
    });
    return result;
  }

  async getComments(responseId) {
    const query = `select responseId, GROUP_CONCAT(comment, "|") as comments 
                    from comments where responseId="${responseId}"`;
    return this.getQuery(query);
  }

  async getAnswers(questionId) {
    const query = `select id,questionId,answer,receivedAt,
                    modifiedAt,is_accepted, votes
                    from answers where questionId="${questionId}"`;
    const answers = await this.executeQuery(query);
    for(let index = 0; index < answers.length; index++) {
      const comments = await this.getComments(answers[index]['id']);
      answers[index]['comments'] = comments['comments'].split('|');
    }
    return answers;
  }

  async getQuestionDetails(id) {
    const query1 = `select id,title,body,votes,receivedAt,modifiedAt 
                          from questions where id="${id}"`;
    const query2 = `select GROUP_CONCAT(t2.title) as tags 
                    from questionTags t1 left join tags t2 on t1.tagId = t2.id 
                      where t1.questionId="${id}"  group by t1.questionId`;
    
    const result = await this.getQuery(query1);
    result['tags'] = (await this.getQuery(query2))['tags'].split(',');
    result['comments'] = (await this.getComments(id))['comments'].split('|');
    result['answers'] = await this.getAnswers(id);
    return result;
  }
  
}

module.exports = DataStore;
