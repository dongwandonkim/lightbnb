const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// const properties = require('./json/properties.json');
// const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryStr = `SELECT * FROM users WHERE users.email = $1`;
  return pool.query(queryStr, [email.toLocaleLowerCase()])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryStr = `SELECT * FROM users WHERE users.id = $1`;
  return pool.query(queryStr, [id])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const {name, email, password} = user;
  const queryStr = `
    INSERT INTO users(name, email, password) VALUES($1, $2, $3)
    RETURNING *;
  `;
  return pool.query(queryStr, [name, email, password])
    .then((res) => {
      return res.rows[0];
    }).catch(err => {
      console.log(err.message);
      return null;
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(`
    SELECT reservations.id as id, properties.title as title, 
    reservations.start_date as start_date, reservations.end_date as end_date, properties.cost_per_night as cost_per_night,
    properties.thumbnail_photo_url, properties.parking_spaces, properties.number_of_bathrooms,
    properties.number_of_bedrooms,
    avg(property_reviews.rating) as average_rating
    FROM properties JOIN reservations ON reservations.property_id = properties.id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    JOIN users ON properties.owner_id = users.id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.title, properties.thumbnail_photo_url,
    reservations.start_date, reservations.end_date, properties.cost_per_night,properties.number_of_bedrooms,
    properties.parking_spaces, properties.number_of_bathrooms
    ORDER BY reservations.start_date
    LIMIT $2;
    `,
    [guest_id, limit])
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getAllReservations = getAllReservations;

const addReservation = (reservation) =>{
  const queryStr = `
    INSERT INTO reservations
    (start_date,
    end_date,
    property_id,
    guest_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const reservationInfo = [
    reservation.start,
    reservation.end,
    reservation.propertyId,
    reservation.guest_id
  ];

  return pool.query(queryStr, reservationInfo)
    .then(res => res.rows[0]);
};
exports.addReservation = addReservation;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  const centsToDollar = 100;

  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city ILIKE $${queryParams.length} `;
  }
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND owner_id = $${queryParams.length} `;
  }
  //check for both values have passed in
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * centsToDollar);
    queryParams.push(options.maximum_price_per_night * centsToDollar);
    queryString += `AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
  }
  
  if (options.minimum_price_per_night) {
    const centsToDollar = 100;
    queryParams.push(options.minimum_price_per_night * centsToDollar);
    queryString += `AND cost_per_night >= $${queryParams.length}`;
  }

  if (options.maximum_price_per_night) {
    const centsToDollar = 100;
    queryParams.push(options.maximum_price_per_night * centsToDollar);
    queryString += `AND cost_per_night <= $${queryParams.length}`;
  }

  // 4
  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryStr = ` 
  INSERT INTO properties(
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
    RETURNING *;
    `;
  const values = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
  ];
  return pool.query(queryStr, values)
    .then((res) => {
      console.log(res.rows);
      return res.rows[0];
    }).catch(err => {
      console.log(err.message);
      return null;
    });
};
exports.addProperty = addProperty;
