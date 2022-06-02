SELECT properties.id as id, properties.title as title, properties.cost_per_night as cost_per_night, avg(property_reviews.rating)
FROM properties JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE properties.city LIKE '%ancouv%'
GROUP BY properties.id, properties.title, properties.cost_per_night
HAVING avg(property_reviews.rating) >= 4
ORDER BY properties.cost_per_night
LIMIT 10;
