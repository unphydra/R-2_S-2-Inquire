const highlightMenuItem = (id) => {
  const menuItem = document.getElementById(id);
  menuItem && menuItem.classList.add('highlight');
};

const renderHeader = (questionsCount, id) => {
  const headers = {
    '/home': 'All Questions',
    '/yourQuestions': `You Have ${questionsCount} Questions`,
    '/yourAnswers': `You Have Answered ${questionsCount} Questions`
  };
  const header = document.querySelector('.con-header-title');
  header.innerText = headers[id];  
};

const main = (questionsCount) => {
  let path = document.location.pathname;
  if (path === '/') {
    path = '/home';
  }
  renderHeader(questionsCount, path);
  highlightMenuItem(path);
  const seconds = 60000;
  setInterval(() => {
    renderDates('.date-time');
  }, seconds);
  renderDates('.date-time');
};
