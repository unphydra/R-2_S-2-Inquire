const checkForm = (id, form) => {
  if (!id) {
    const popUp = form.lastChild.lastChild;
    popUp.classList.remove('hide');
    const second = 5000;
    setTimeout(() => popUp.classList.add('hide'), second);
    return false;
  }
  return true;
};

const updateVote = (url, container) => {
  fetch(url).then((res) => res.json()).then(data => {
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
