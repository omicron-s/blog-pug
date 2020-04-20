$(function() {
  if ($('.pagination').length === 0) return; // Обрабатывать только там, где присутствует пагинация
  $('.pagination__pages a').click(function(e) {
    e.preventDefault();
    $('.pagination__pages a').removeClass('active');
    $(this).addClass('active');
  });
});
