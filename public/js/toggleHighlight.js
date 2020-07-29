const highlighter = function(id) {
  const menuItems = Array.from(document.querySelectorAll('.menu-item'));
  menuItems.forEach(item => {
    if (item.id === id) {
      item.classList.add('highlight');
    }
  });
};
