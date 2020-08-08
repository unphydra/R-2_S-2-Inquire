const togglePopUp = (element, className, message) => {
  message && (element.innerText = message);
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
  const popUp = button.parentElement.lastElementChild;
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

const updateHighlightVote = function (data, container) {
  const parent = container.parentElement;
  const [downArrow, upArrow] =
    [parent.lastElementChild, parent.firstElementChild];
  downArrow.classList.remove('highlightDownArrow');
  upArrow.classList.remove('highlightUpArrow');
  const upVote = 1, downVote = -1;
  if (data.type === downVote) {
    downArrow.classList.add('highlightDownArrow');
  }
  if (data.type === upVote) {
    upArrow.classList.add('highlightUpArrow');
  }
};

const updateVote = (url, table, responseId, container) => {
  const options = getFetchOptions('POST', { table, responseId: +responseId });
  fetch(url, options).then((res) => res.json()).then(data => {
    const ONE = 1, zero = 0;
    if(data && 'vote' in data){
      container
        .parentElement
        .children[ONE]
        .firstChild
        .firstChild
        .innerText = data.vote || zero;
      return updateHighlightVote(data, container, url);
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

const toggleCommentBox = (addComment) => 
  addComment.nextElementSibling.classList.toggle('hide');

const moveCursor = (element) => {
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(element.childNodes['0'], element.innerText.length);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  element.focus();
};

const convertToHtml = function(text) {
  const div = document.createElement('div');
  div.innerHTML = text;
  return Array.from(div.children);
};

const postComment = function(boxId, qId, resId, table) {
  const commentBox = document.querySelector(`#${boxId}`);
  const comment = commentBox.firstChild.value;
  const length = comment.length;
  const popup = document.querySelector(`#${boxId}p`);
  const lowerLimit = 9, upperLimit = 180;
  if(length < lowerLimit || length > upperLimit) {
    return togglePopUp(popup, 'hide', '*please enter at least ten character');
  }
  const body = {questionId: +qId, responseId: +resId, table, comment};
  return fetch('/postComment', getFetchOptions('POST', body))
    .then(res => {
      if (res.statusText === 'OK') {
        return res.text();
      }
    })
    .then(text => {
      if (text) {
        convertToHtml(text).forEach(ele =>
          commentBox.
            parentElement.insertBefore(ele, commentBox.previousElementSibling)
        );
        toggleCommentBox(commentBox.previousSibling);
        renderDates('.q-comment-time');
        renderDates('.a-comment-time');
      }
    });
};

const main = () => {
  renderDates('.time');
  renderDates('.q-comment-time');
  renderDates('.a-comment-time');
  renderEditor();
};
