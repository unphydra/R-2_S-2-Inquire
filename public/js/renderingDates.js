
const renderDate = (element) => {
  const date = moment.utc(element.getAttribute('time')).local();
  element.innerText = ` ${date.startOf('min').fromNow()}`;
};

const renderDates = (selector) => {
  const spans = Array.from(document.querySelectorAll(selector));
  spans.forEach(renderDate);
};
