const getElementById = (id) => document.getElementById(id);

const renderQuestions = (questions) => {
  let html = '';
  questions.forEach((question) => {
    const { votes, answers, title, tags } = question;
    const tagshtml = tags.map((tag) => `<div>${tag}</div>`);
    html += `<div class="question">
            <div class="countName"> 
              <span class="count"> ${answers} </span> <br /> answers
            </div>
            <div class="countName"> 
              <span class="count"> ${votes} </span> <br /> votes
            </div>
            <div>
              <div class="title">${title}</div>
              <div class="tags">${tagshtml.join('')}</div>
            </div>
          </div>`;
  });
  getElementById('questions').innerHTML = html;
};

const getQuestions = () => {
  sendRequest('/questions', renderQuestions);
};

window.onload = getQuestions;
