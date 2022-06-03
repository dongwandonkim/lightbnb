$(()=> {
  $('body').on('click', '.btn_reservation', function() {
    const key = $(this).attr('data-input');
    console.log($(this).attr('data-input'));
 
    $(`.${key}-key`).css("display", "block");

    
    $('.start-date').prop('value', function() {
      return new Date().toJSON().split('T')[0];
    });
    $('.start-date').prop('min', function() {
      return new Date().toJSON().split('T')[0];
    });
    $('.end-date').prop('min', function() {
      return new Date().toJSON().split('T')[0];
    });
  });

  $('.reservation_form').on('submit', function(event) {
    event.preventDefault();
    
    views_manager.show('none');

    const data = $(this).serialize();
       
    createReservation(data)
      .then(() => {
        alert('success');
        views_manager.show('createReservation');
      })
      .catch(error => {
        console.error(error);
        views_manager.show('listings');
      });
  });

});