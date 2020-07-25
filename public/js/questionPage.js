const getElement = (selector) => document.querySelector(selector);
const getAllElements = (selector) => document.querySelectorAll(selector);

const commentsTemplate = (comments) => {
  return `
    <div class="comments">
      <span>Comments:</span>
      ${comments.map(comment => `<div>${comment.comment}</div>`).join('')}
    </div>`;
};

const answerTemplate = (answer) => {
  return `
    <div class="flex-row">
      <div class="question-body"> ${answer.answer}</div>
        <div class="countName"> 
          <span class="count"> ${answer.votes} </span> <br /> votes
        </div>
    </div>
    ${commentsTemplate(answer.comments)}`;
};

const renderQuestionDetails = (questionDetails) => {
  const {title, body, tags, comments, answers, votes} = questionDetails;

  const html = `
  <div class="question-title"> ${title} </div>
    <div class="flex-row">
      <div class="question-body"> ${body} </div>
      <div class="countName"> 
        <span class="count"> ${votes} </span> <br /> votes
      </div>
    </div>
    <div class="tags">
      ${tags.map(tag => `<div>${tag.title}</div>`).join('')}
    </div>
    ${commentsTemplate(comments)}
    <div class="answers"> 
      <span>2 Answers:</span>
      ${answers.map(answer => answerTemplate(answer))}
    </div>`;

  getElement('.question-details').innerHTML = html;
};

const renderQuestionPage = (res) => {
  if(res.userId) {
    getAllElements('.unauthBtn').forEach((btn) => btn.classList.add('hide'));
    getAllElements('.menu-item').forEach((item) => {
      item.classList.remove('hide');
    });
    const avatar = getElement('.avatar');
    avatar.setAttribute('src', res.avatar);
    avatar.classList.remove('hide');
  }
  renderQuestionDetails(res.questionDetails);
};

const getQuestion = () => {
  const [,, id] = document.location.pathname.split('/');
  sendRequest(`/questionDetails/${id}`, renderQuestionPage);
};
