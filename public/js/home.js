const getElement = (selector) => document.querySelector(selector);
const getAllElements = (selector) => document.querySelectorAll(selector);

const renderQuestions = (questions) => {
  let html = '';
  questions.forEach((question) => {
    const { id, votes, answers, title, tags } = question;
    const tagshtml = tags.map((tag) => `<div>${tag}</div>`);
    html += `<div class="question">
            <div class="countName"> 
              <span class="count"> ${answers} </span> <br /> answers
            </div>
            <div class="countName"> 
              <span class="count"> ${votes} </span> <br /> votes
            </div>
            <div>
              <div class="title" id="${id}">
                <a href="/question/${id}">${title}</a>
              </div>
              <div class="tags">${tagshtml.join('')}</div>
            </div>
          </div>`;
  });
  getElement('#questions').innerHTML += html;
};

const renderHomepage = (res) => {
  if (res.userId) {
    getAllElements('.unauthBtn').forEach((btn) => btn.classList.add('hide'));
    getElement('#askbtn').classList.remove('hide');
    getAllElements('.menu-item').forEach((item) => {
      item.classList.remove('hide');
    });
    const avatar = getElement('.avatar');
    avatar.setAttribute('src', res.avatar);
    avatar.classList.remove('hide');
  }
  renderQuestions(res.questions);
};

const getQuestions = () => {
  sendRequest('/questions', renderHomepage);
};

window.onload = getQuestions;
