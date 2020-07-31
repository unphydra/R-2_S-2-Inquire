let quill;
const main = function() {
  const toolbarOptions = [
    ['bold', 'italic', 'underline'], 
    ['code-block', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],

    [{ color: [] }], 
    [{ align: [] }],

    ['clean'],
  ];
  quill = new Quill('#editor', {
    modules: {
      syntax: true,
      toolbar: toolbarOptions,
    },
    theme: 'snow',
  });
};

window.onload = main;
