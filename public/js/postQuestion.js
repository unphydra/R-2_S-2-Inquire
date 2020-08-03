const showError = function(id) {
  const error = document.getElementById(id);
  error.classList.remove('blind');
  const second = 5000;
  setTimeout(() => error.classList.add('blind'), second);
};

const postQuestion = function(button) {
  const title = document.querySelector('input[name="title"');
  const tags = document.querySelector('input[name="tags"');
  const TiL = 20, BL = 30, TaL = 2;
  if(title.value.length < TiL) {
    return showError('title-error');
  }
  if(quill.getLength() < BL) {
    return showError('body-error');
  }
  if(tags.value.length < TaL) {
    return showError('tag-error');
  }
  fetch('/postQuestion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: 
      JSON.stringify(
        {
          title: title.value, 
          tags: tags.value, 
          body: quill.root.innerHTML
        }
      )
  }).then(res => {
    window.location.href = res.url;
  });
}; 
