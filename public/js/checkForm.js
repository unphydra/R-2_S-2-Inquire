const checkForm = (id) => {
  if (!id) {
    const popUp = document.querySelector('.popUp');
    popUp.classList.remove('hide');
    const second = 5000;
    setTimeout(() => popUp.classList.add('hide'), second);
    return false;
  }
  return true;
};
