const togglePopUp = (element, className, message) => {
  element.innerText = message;
  element.classList.remove(className);
  const seconds = 5000;
  setTimeout(() => element.classList.add(className), seconds);
};

const getFetchOptions = (method, body) => {
  return {
    method,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  };
};

const postAnswer = function (user, qId, button) {
  const BL = 30;
  const popUp = button.nextElementSibling;
  if (!user) {
    const message = '* please login before continue';
    return togglePopUp(popUp, 'hide', message);
  }
  if (quill.getLength() < BL) {
    const message = '* please explain in brief';
    return togglePopUp(popUp, 'hide', message);
  }
  const body = {answer: quill.root.innerHTML};
  fetch(`/postAnswer/${qId}`, getFetchOptions('POST', body)).then(res => {
    window.location.href = res.url;
  });
};

const toggleEditBtns = (editBtns) => {
  Array.from(editBtns.children).forEach((btn) => {
    btn.classList.toggle('hide');
  });
};

const makeCommentEditable = (editBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`);
  comment.setAttribute('contenteditable', true);
  toggleEditBtns(editBtn.parentElement);
  moveCursor(comment);
  localStorage.setItem('oldComment', comment.innerText);
};

const makeCommentUneditable = (cancelBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`);
  comment.setAttribute('contenteditable', false);
  toggleEditBtns(cancelBtn.parentElement);
  comment.innerText = localStorage.getItem('oldComment');
  localStorage.removeItem('oldComment');
};

const updateComment = (commentId, questionId) => {
  const comment = document.querySelector(`#${commentId}`);
  const body = {comment: comment.innerText, commentId};
  const options = getFetchOptions('POST', body);
  fetch(`/updateComment/${questionId}`, options).then((res) => {
    localStorage.removeItem('oldComment');
    window.location.href = res.url;
  });
};

const makeAnswerEditable = (editBtn, boxId, answerId) => {
  const answer = document.querySelector(`#${boxId}`);
  const formFooter = document.querySelector('.edit-answer-btns');
  editBtn.classList.add('hide');
  toggleEditBtns(formFooter);
  quill.root.innerHTML = answer.innerHTML;
  localStorage.setItem('answerId', answerId);
};

const makeAnswerUneditable = (questionId) => {
  document.location = `/question/${questionId}`;
};

const updateAnswer = (questionId) => {
  const answerId = localStorage.getItem('answerId');
  localStorage.removeItem('answerId');
  const body = {
    answer: quill.root.innerHTML, answerId: +answerId, questionId: +questionId
  };
  const options = getFetchOptions('POST', body);
  fetch('/updateAnswer', options).then((res) => {
    window.location.href = res.url;
  });
};

const makeQuestionEditable = (questionId) => {
  document.location = `/editQuestion/${questionId}`;
};

const updateVote = (url, table, responseId, container) => {
  const options = getFetchOptions('POST', { table, responseId: +responseId });
  fetch(url, options).then((res) => res.json()).then(data => {
    const ONE = 1;
    if(data && 'vote' in data){
      container
        .parentElement
        .children[ONE]
        .firstChild
        .firstChild
        .innerText = data.vote;
    }
  });
};

const updateAcceptAnswer = (qOwnerId, answerId, tickMark) => {
  const ONE = 1;
  const url = '/acceptAnswer';
  const body = {qOwnerId: +qOwnerId, answerId: +answerId};
  fetch(url, getFetchOptions('POST', body))
    .then((res) => res.json())
    .then(data => {
      if(data && data.isAccepted === ONE) {
        tickMark.firstElementChild.setAttribute('fill', '#42B883');
      }
    });
};

const toggleCommentBox = (className) => {
  const commentBox = document.querySelector(className);
  if(commentBox.classList.contains('hide')) {
    commentBox.classList.remove('hide');
    return '0';
  }
  commentBox.classList.add('hide');
};

const moveCursor = (element) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(element.childNodes['0'], element.innerText.length);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  element.focus();
};

const main = () => {
  renderDates('.time');
  renderDates('.q-comment-time');
  renderDates('.a-comment-time');
  renderEditor();
};
