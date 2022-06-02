SELECT reservations.id as id, properties.title as title, 
reservations.start_date as start_date, properties.cost_per_night as cost_per_night,
avg(property_reviews.rating) as average_rating
FROM properties JOIN reservations ON reservations.property_id = properties.id
JOIN property_reviews ON property_reviews.property_id = properties.id
JOIN users ON properties.owner_id = users.id
WHERE reservations.guest_id = 1
GROUP BY reservations.id, properties.title, 
reservations.start_date, properties.cost_per_night
ORDER BY reservations.start_date
LIMIT 10;