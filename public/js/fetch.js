const sendRequest = (url, callback) => {
  fetch(url, { method: 'GET' })
    .then((res) => res.json())
    .then(callback);
};
