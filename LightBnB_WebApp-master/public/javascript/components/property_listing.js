$(() => {
  window.propertyListing = {};
  
  function createListing(property, isReservation) {
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>number_of_bedrooms: ${property.number_of_bedrooms}</li>
            <li>number_of_bathrooms: ${property.number_of_bathrooms}</li>
            <li>parking_spaces: ${property.parking_spaces}</li>
          </ul>
          ${isReservation ?
    `<p>${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}</p>`
    : `
      <button class="btn_reservation" data-input="${property.id}">make a reservation</button>
            
      <form action="/api/reservations" method="POST" class="reservation_form ${property.id}-key" style="display: none">
      <input type="hidden" name="propertyId" value="${property.id}" >
        <label>
          Start Date:
          <input class="start-date" type="date" name="start">
        </label>
        <label>
          End Date:
          <input class="end-date" type="date" name="end">
        </label>
        <button>Submit</button>
      </form>
    `}
          <footer class="property-listing__footer">
            <div class="property-listing__rating">${Math.round(property.average_rating * 100) / 100}/5 stars</div>
            <div class="property-listing__price">$${property.cost_per_night / 100.0}/night</div>
          </footer>
        </section>
      </article>
    `;
  }

  window.propertyListing.createListing = createListing;

});