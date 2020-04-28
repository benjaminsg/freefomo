const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const doTicketmaster = async (url, value) => {
    let returnValueRaw = await fetch(url + value);
    let returnValue = await returnValueRaw.json();
    return returnValue;
};
/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', function(req, res, next) {
    console.log(req.query.title);
    doTicketmaster(config.ticketmasterAttractionID, `&keyword=${req.query.title}`)
        // get the attraction IDa
        .then(ticketmasterJSON => {
            return ticketmasterJSON._embedded.attractions[0].id;
        })
        // get the events for the attraction ID
        .then (ticketmasterID => {
            console.log(ticketmasterID);
            return doTicketmaster(config.ticketmasterEvents,`&attractionId=${ticketmasterID}&${req.query.state}`);
        })
        .then (events => {
            // render events in json object to be parsed in pug file (see index.js)
            let data = [];
            let i;
            for (i = 0; i < 3; i ++){
                let event = {
                    "artistName": req.query.title,
                    "eventTitle": events._embedded.events[i].name,
                    "location": events._embedded.events[i]._embedded.venues[0].city.name,
                    "date": events._embedded.events[i].dates.start.localDate,
                    "time" : events._embedded.events[i].dates.start.localTime
                }
                data.push(event);
            }
            res.render('users',
                {title: req.query.title,
                    events: data})

        })
        .catch(e => {
            console.log(e);
        })
});
module.exports = router;
