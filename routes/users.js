const express = require('express');
const fetch = require('node-fetch')
const router = express.Router();


const ticketmasterAPI = {
  url: 'https://postman-echo.com/get?test='
}

const doTicketmaster = async (value) => {
  let returnValueRaw = await fetch(ticketmasterAPI.url + value);
  let returnValue = await returnValueRaw.json();
  return returnValue;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  // console.log(req.query.title);
    doTicketmaster(`${req.query.title}`)
      .then(returnValue => {
        console.log(returnValue.args.test + ' is the best singer');
        res.send('request received accurately!');
      });
});

module.exports = router;
