const checkForm = (id) => {
  if (!id) {
    const popUp = document.querySelector('.popUp');
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
    if(data && data.count){
      container
        .parentElement
        .children[ONE]
        .firstChild
        .firstChild
        .innerText = data.count;
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
