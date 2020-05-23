$(function() {
  
  function setResult(form, result, error) {
    var input = $(form).find('.result')
    input.val(result)
    if (error) {
      input.addClass('error')
    } else {
      input.removeClass('error')
    }
  }
  
  $('form').on('submit', function(event) {
    var form = this
    event.preventDefault()
    $.get(form.id, $(form).serialize(), null, 'text')
    .done(function(data) {
      setResult(form, data)
    })
    .fail(function(error) {
      setResult(form, error.responseText, true)
    })
  })
  
  $('form').submit()

})
