const express = require('express');
const router = express.Router();
// manually put in order for gods sake thanks stack overflow
const usa = ["AL", "AK", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
  "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD",
  "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH",
  "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WI", "WV", "WY"];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
      { title: 'freefomo' ,
        states: usa});
});


module.exports = router;
