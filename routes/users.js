const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');

const doTicketmaster = async (url, value) => {
    let returnValueRaw = await fetch(url + value);
    let returnValue = await returnValueRaw.json();
    return returnValue;
};

let data3 = [];

/* integrates spotify artist & current location w/ ticketmaster API to get events */
const get_events = async(artist,state) => {
    // console.log(artist);
    let data2 = [];
    await doTicketmaster(config.ticketmasterAttractionID, `&keyword=${artist}`)
        // get the attraction IDa
        .then(ticketmasterJSON => {
            return ticketmasterJSON._embedded.attractions[0].id;
        })
        // get the events for the attraction ID
        .then(ticketmasterID => {
            console.log(ticketmasterID);
            return doTicketmaster(config.ticketmasterEvents, `&attractionId=${ticketmasterID}&${state}`);
            //  return doTicketmaster(config.ticketmasterEvents,`&attractionId=${ticketmasterID}&${req.query.state}`);
        })
        .then(events => {
            // render events in json object to be parsed in pug file (see index.js)
            let data = [];
            let i;
            for (i = 0; i < 3; i++) {
                let event = {
                    "artistName": artist,
                    "eventTitle": events._embedded ? events._embedded.events[i].name:null,
                    "location": events._embedded ? events._embedded.events[i]._embedded.venues[0].city.name:null,
                    "date": events._embedded ? events._embedded.events[i].dates.start.localDate:null,
                    "time": events._embedded ? events._embedded.events[i].dates.start.localTime:null
                }
                data.push(event);
                data2.push(event);
                data3.push(event);
            }
            // res.render('user',
            //     {title: artist,
            //      events: data})
            // console.log(data);
            // console.log(data2);
            // return data2;
        })
        .catch(e => {
            console.log(e);
        })
    console.log('this is data2:')
    console.log(data2);
    return data2;
};

let test = get_events("Aladdin", "MA");

console.log(test);
console.log("type of test is " + typeof test);

// module.exports = {events:get_events()};