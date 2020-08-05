const highlightMenuItem = (id) => {
  const menuItem = document.getElementById(id);
  menuItem && menuItem.classList.add('highlight');
};

const main = () => {
  let path = document.location.pathname;
  if (path === '/') {
    path = '/home';
  }
  highlightMenuItem(path);
  const seconds = 60000;
  setInterval(() => {
    renderDates('.date-time');
  }, seconds);
  renderDates('.date-time');
};
