const createProfileDetailsHtml = function(details) {
  let html = `<div class="topBox">
  <div class="bigAvatar">
    <img src=${details.avatar} alt="avatar">
  </div>
  <div class="details">
    <div class="username">${details.username}</div>
    <div class="name">Name : <span>${details.name}</span></div>`;
  details.email && 
  (html += `<div class="sideInfo">Email : <span>${details.email}</span></div>`);
  details.company && 
  (html += `<div class="sideInfo">Company : <span>
  ${details.company}</span></div>`);
  html += '</div></div>';
  details.bio && (html += `<h3>Bio</h3>
  <div class="bio">${details.bio}</div>`);
  return html;
};

const main = async function(){
  const [, id] = document.location.search.split('=');
  fetch(`/getProfile?id=${id}`, {method: 'GET'})
    .then(res => res.json())
    .then(details => {
      const sideContainer = document.querySelector('#sideContainer');
      sideContainer.innerHTML = createProfileDetailsHtml(details);
    })
    .catch(err => {
      err && (document.body.innerText = 'not found');
    });
};

window.onload = main;
