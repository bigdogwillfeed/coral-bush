// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');
  
  function setResult(form, result, error) {
    var input = $(form).find('.result').first();
    input.val(result);
    if (error) {
      input.addClass('error');
    } else {
      input.removeClass('error');
    }
  }
  
  $('form').on('submit', function(event) {
    var form = this;
    event.preventDefault();
    $.get(form.id, $(form).serialize())
    .done(function(data) {
      setResult(form, data);
    })
    .error(function(error) {
      setResult(form, error.responseText, true);
    });
  });
  
  $('form').submit();

});
