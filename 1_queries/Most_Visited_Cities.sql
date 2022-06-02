SELECT properties.city, count(reservations) as reservations
FROM properties JOIN reservations ON reservations.property_id = properties.id
GROUP BY properties.city
ORDER BY reservations DESC;