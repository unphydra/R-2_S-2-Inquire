let quill;
const renderEditor = function() {
  const toolbarOptions = [
    ['bold', 'italic', 'underline'], 
    ['code-block', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }], 
    [{ align: [] }],
  ];
  quill = new Quill('#editor', {
    modules: {
      syntax: true,
      toolbar: toolbarOptions,
    },
    theme: 'snow',
  });
};

