const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');

const doTicketmaster = async (url, value) => {
  let returnValueRaw = await fetch(url + value);
  let returnValue = await returnValueRaw.json();
  return returnValue;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log(req.query.title);
    doTicketmaster(config.ticketmasterAttractionID, `&keyword=${req.query.title}`)
        // get the attraction ID
      .then(ticketmasterJSON => {
        return ticketmasterJSON._embedded.attractions[0].id;
      })

        // get the events for the attraction ID
        .then (ticketmasterID => {
            console.log(ticketmasterID);
            return doTicketmaster(config.ticketmasterEvents,`&attractionId=${ticketmasterID}&${req.query.state}`);
        })

            .then (events => {
                console.log();
                // render events in json object to be parsed in pug file (see index.js)
                res.render('layout',
                    {title:'request received accurately!',
                     events: JSON.stringify(events._embedded.events)});
            })

      .catch(e => {
        console.log(e);
      })
});

module.exports = router;
