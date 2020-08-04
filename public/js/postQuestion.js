const showError = function(id) {
  const error = document.getElementById(id);
  error.classList.remove('blind');
  const second = 5000;
  setTimeout(() => error.classList.add('blind'), second);
};

const toggleTagSuggestions = (inputBox) => {
  const tagSuggestions = document.querySelector('.tag-suggestions');
  if(inputBox.value.trim() !== '') {
    return tagSuggestions.classList.remove('hide');
  }
  tagSuggestions.classList.add('hide');
};  

const removeTag = (tag) => {
  const tags = document.querySelector('.tags');
  tags.removeChild(tag.parentElement);
};

const deselectTag = (inputBox) => {
  const tags = document.querySelector('.tags');
  if (inputBox.value === '' && tags.children.length) {
    tags.removeChild(tags.lastChild);
  }
};

const selectTag = (tagName) => {
  const html = `
    <div class="tag">
      <span>${tagName}</span> &nbsp;
      <span class="cross-btn" onclick="removeTag(this)"> X </span>
    </div>`;
  const tags = document.querySelector('.tags');
  tags.innerHTML += html;
  tags.nextElementSibling.value = '';
};

const addTag = (inputBox) => {
  if(event.key === 'Backspace') {
    return deselectTag(inputBox);
  }
  if(event.key !== 'Enter' || inputBox.value.trim() === '') {
    return '0';
  }
  selectTag(inputBox.value);
};

const getTags = () => {
  const tags = Array.from(document.querySelectorAll('.tag span:first-child'));
  return tags.map((tag) => tag.innerText.trim());
};

const postQuestion = function(button) {
  const title = document.querySelector('input[name="title"');
  const tags = Array.from(document.querySelectorAll('.tag'));
  const TiL = 20, BL = 30, TaL = 2;
  if(title.value.length < TiL) {
    return showError('title-error');
  }
  if(quill.getLength() < BL) {
    return showError('body-error');
  }
  if(tags.length < TaL) {
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
          tags: getTags(), 
          body: quill.root.innerHTML
        }
      )
  }).then(res => {
    window.location.href = res.url;
  });
}; 
