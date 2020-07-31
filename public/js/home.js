const toggleTickMark = () => {
  const questions = Array.from(document.querySelectorAll('.question'));
  questions.forEach((question) => {
    question.children['0'].classList.add('hide');
    question.children['1'].classList.remove('hide');
  });
};

const highlightMenuItem = (id) => {
  const menuItem = document.getElementById(id);
  menuItem.classList.add('highlight');
};

const renderHeader = function (questionsCount, id) {
  const headers = {
    '/home': 'All Questions',
    '/yourQuestions': `You Have ${questionsCount} Questions`,
    '/yourAnswers': `You Have Answered ${questionsCount} Questions`
  };
  const header = document.querySelector('.con-header-title');
  header.innerText = headers[id];  
};

const main = function(questionsCount) {
  let id = document.location.pathname;
  if (id === '/') {
    id = '/home';
  }
  renderHeader(questionsCount, id);
  highlightMenuItem(id);
  if(id === '/yourAnswers') {
    toggleTickMark();  
  }
};
