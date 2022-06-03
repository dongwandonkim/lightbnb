module.exports = function(router, database) {

  router.get('/properties', (req, res) => {
    database.getAllProperties(req.query, 20)
      .then(properties => res.send({properties}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  router.get('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.error("💩");
      return;
    }
    database.getAllReservations(userId)
      .then(reservations => res.send({reservations}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  router.post('/reservations', (req, res) => {
    const {start, end, propertyId} = req.body;
    if (!start.length || !end.length || !propertyId) {
      return res.send("no");
    }
    const userId = req.session.userId;
    if (!userId) {
      res.send("💩");
      return;
    }

    database.addReservation({...req.body, guest_id: userId})
      .then(reservation => {
        res.send(reservation);
      }).catch(err => {
        console.error(err);
        res.send(err);
      });
    
  });

  router.post('/properties', (req, res) => {
    const userId = req.session.userId;
    database.addProperty({...req.body, owner_id: userId})
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });

  return router;
};