const toggleClass = (element, message) => {
  element.innerText = message;
  element.classList.remove('hide');
  const seconds = 5000;
  setTimeout(() => element.classList.add('hide'), seconds);
};

const postAnswer = (id, qId, button) => {
  const answerLength = quill.getLength();
  const BL = 30;
  const popUp = button.nextElementSibling;
  if (!id) {
    const message = '* please login before continue';
    return toggleClass(popUp, message);
  }
  if (answerLength < BL) {
    const message = '* please explain in brief';
    return toggleClass(popUp, message);
  }
  fetch(`/postAnswer/${qId}`, {method: 'POST', headers: {
    'Content-Type': 'application/json'},
  body: JSON.stringify({answer: quill.root.innerHTML})}).then(res => {
    window.location.href = res.url;
  });
};

const updateVote = (url, container) => {
  fetch(url, {method: 'POST'}).then((res) => res.json()).then(data => {
    const ONE = 1;
    if(data && 'votes' in data){
      container
        .parentElement
        .children[ONE]
        .firstChild
        .firstChild
        .innerText = data.votes;
    }
  });
};

const updateAcceptAnswer = (questionId, answerId, tickmark) => {
  const ONE = 1;
  const url = `/acceptAnswer/${questionId}/${answerId}`;
  const options = {
    method: 'POST'
  };
  fetch(url, options).then((res) => res.json()).then(data => {
    if(data && data.isAccepted === ONE) {
      tickmark.setAttribute('src', '/images/greentickmark.png');
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

const makeCommentEditable = (editBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`);
  comment.setAttribute('contenteditable', true);
  editBtn.classList.add('hide');
  editBtn.parentElement.children['1'].classList.remove('hide');
  editBtn.parentElement.children['2'].classList.remove('hide');
  localStorage.setItem('oldComment', comment.innerText);
};

const makeCommentUneditable = (cancelBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`);
  comment.setAttribute('contenteditable', false);
  cancelBtn.classList.add('hide');
  cancelBtn.parentElement.children['0'].classList.remove('hide');
  cancelBtn.parentElement.children['2'].classList.add('hide');
  comment.innerText = localStorage.getItem('oldComment');
  localStorage.removeItem('oldComment');
};

const saveComment = (saveBtn, commentId) => {
  const comment = document.querySelector(`#${commentId}`);
  const options = { 
    headers: { 'Content-Type': 'application/json' },
    method: 'POST', 
    body: JSON.stringify({comment: comment.innerText, commentId})
  };
  fetch('/updateComment', options).then((res) => res.json()).then(data => {
    comment.innerText = data.comment;
    saveBtn.classList.add('hide');
    saveBtn.parentElement.children['0'].classList.remove('hide');
    saveBtn.parentElement.children['1'].classList.add('hide');
  });
};
