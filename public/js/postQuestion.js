const showError = function() {
  const error = document.getElementById('error');
  error.classList.remove('blind');
  const second = 5000;
  setTimeout(() => error.classList.add('blind'), second);
};

const postQuestion = function(button) {
  const title = document.querySelector('input[name="title"');
  const tags = document.querySelector('input[name="tags"');
  const titleLength = title.value.length;
  const tagsLength = tags.value.length;
  const bodyLength = quill.getLength();
  const TiL = 20, TaL = 2, BL = 30;
  if(titleLength < TiL && tagsLength < TaL && bodyLength < BL) {
    showError();
    return;
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
