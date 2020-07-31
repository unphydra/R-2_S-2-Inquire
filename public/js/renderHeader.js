const renderHeader = function (questionsCount) {
  let id = document.location.pathname;
  if (id === '/') {
    id = '/home';
  }
  const headers = {
    '/home': 'All Questions',
    '/yourQuestions': `You Have ${questionsCount} Questions`
  };
  const menuItem = document.getElementById(id);
  menuItem.classList.add('highlight');
  const header = document.querySelector('.con-header-title');
  header.innerText = headers[id];
};
