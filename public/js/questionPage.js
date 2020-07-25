const renderQuestionDetails = (res) => {};

const getQuestion = () => {
  const [,, id] = document.location.pathname.split('/');
  sendRequest(`/questionDetails/${id}`, renderQuestionDetails);
};
