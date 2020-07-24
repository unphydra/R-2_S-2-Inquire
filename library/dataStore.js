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
}

module.exports = DataStore;
