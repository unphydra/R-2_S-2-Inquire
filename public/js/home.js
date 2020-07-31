const toggleTickMark = () => {
  const questions = Array.from(document.querySelectorAll('.question'));
  questions.forEach((question) => {
    question.children['0'].classList.add('hide');
    question.children['1'].classList.remove('hide');
  });
};

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
  if(id === '/yourAnswers') {
    toggleTickMark();  
  }
};

const renderDates = () => {
  const spans = Array.from(document.querySelectorAll('.date-time'));
  spans.forEach((span) => {
    const date = moment(span.getAttribute('time'));
    span.innerText = date.startOf('min').fromNow();
  });
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
    renderDates();
  }, seconds);
  renderDates();
};
