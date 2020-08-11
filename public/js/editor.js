const renderEditor = function(editorId) {
  const toolbarOptions = [
    ['bold', 'italic', 'underline'], 
    ['code-block', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }], 
    [{ align: [] }],
  ];
  return new Quill(editorId, {
    modules: {
      syntax: true,
      toolbar: toolbarOptions
    },
    theme: 'snow',
  });
};

