const getFetchOptions = (method, body) => {
  return {
    method,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  };
};

const fetchReqText = (url, options) => {
  return fetch(url, options).then(res => res.statusText === 'OK' && res.text());
};

const togglePopUp = (element, className, message) => {
  message && (element.innerText = message);
  element.classList.remove(className);
  const seconds = 5000;
  setTimeout(() => element.classList.add(className), seconds);
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

const toggleHide = (elements) => {
  elements.forEach((btn) => {
    btn.classList.toggle('hide');
  });
};

const makeCommentEditable = (editBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`).firstChild;
  comment.setAttribute('contenteditable', true);
  toggleHide(Array.from(editBtn.parentElement.children));
  moveCursor(comment);
  localStorage.setItem('oldComment', comment.innerText);
};

const makeCommentUneditable = (cancelBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`).firstChild;
  comment.setAttribute('contenteditable', false);
  toggleHide(Array.from(cancelBtn.parentElement.children));
  comment.innerText = localStorage.getItem('oldComment');
  localStorage.removeItem('oldComment');
};

const updateComment = (commentId) => {
  const comment = document.querySelector(`#c${commentId}`);
  const body = {comment: comment.firstChild.innerText, commentId: +commentId};
  return fetchReqText('/updateComment', getFetchOptions('POST', body))
    .then(data => {
      if (data) {
        comment.innerHTML = data;
        localStorage.removeItem('oldComment');
        renderAllDates();
      }
    });
};

const makeAnswerEditable = (editBtn, answerId) => {
  const answerBox = document.querySelector(`#a${answerId}`);
  const editorBox = answerBox.firstChild;
  const answer = editorBox.nextElementSibling;
  const deleteBtn = editBtn.nextSibling;
  toggleHide([editBtn, deleteBtn, editorBox, answer]);
  const answerQuill = renderEditor(`#a${answerId}e`);
  answerQuill.root.innerHTML = answer.innerHTML;
};

const makeAnswerUneditable = (ansDivId) => {
  const answerBox = document.querySelector(`#${ansDivId}`);
  const editorBox = answerBox.firstChild;
  const answer = editorBox.nextElementSibling;
  const buttons = Array.from(
    answerBox.nextSibling.querySelectorAll('.edit-btn')
  );
  toggleHide([...buttons, editorBox, answer]);
  editorBox.removeChild(editorBox.firstChild);
};

const updateAnswer = (questionId, answerId) => {
  const editorBox = document.querySelector(`#a${answerId}e`).firstChild;
  const body = {
    answer: editorBox.innerHTML, answerId: +answerId, questionId: +questionId
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
    const zero = 0;
    if(data && 'vote' in data){
      container
        .parentElement
        .querySelector('span')
        .innerText = data.vote || zero;
      return updateHighlightVote(data, container);
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

const toggleBox = (addComment, userInfo) => {
  if(userInfo) {
    return toggleCommentBox(addComment);
  }
  togglePopUp(addComment.lastChild, 'hide');
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
  return fetchReqText('/postComment', getFetchOptions('POST', body))
    .then(data => {
      if (data) {
        const comments = document.querySelector(`#${table}_${resId}`);
        comments.innerHTML += data;
        toggleCommentBox(commentBox.previousSibling);
        renderAllDates();
      }
    });
};

const deleteComment = function(id) {
  const options = getFetchOptions('POST', {commentId: +id});
  fetch('/deleteComment', options).then(res => {
    if (res.statusText === 'OK') {
      const comment = document.querySelector(`#c${id}`);
      comment.parentElement.removeChild(comment);
    }
  });
};

const deleteAnswer = function(qId, aId) {
  const body = {questionId: +qId, answerId: +aId};
  const options = getFetchOptions('POST', body);
  fetch('/deleteAnswer', options)
    .then(res => {
      window.location.href = res.url;
    });
};

const renderAllDates = () => {
  renderDates('.time');
  renderDates('.q-comment-time');
  renderDates('.a-comment-time');
};

let quill;
const main = () => {
  renderAllDates();
  quill = renderEditor('#editor');
  const seconds = 60000;
  setInterval(() => {
    renderAllDates();
  }, seconds);
};
