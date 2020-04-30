const express = require('express');
const fetch = require('node-fetch');
const async = require('async');
const router = express.Router();
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
const data = [];

const delay = (duration) =>
    new Promise(resolve => setTimeout(resolve, duration));

const doTicketmaster = async (url, value) => {
    let returnValueRaw = await fetch(url + value);
    let returnValue = await returnValueRaw.json();
    await delay(300);
    return returnValue;
};
/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', async function(req, res, next) {
    const user = req.query.username;
    MongoClient.connect(config.connectionString, {
        useUnifiedTopology: true
    })
        .then(client => {
            console.log('Connected to Database');
            const db = client.db('user-info');
            const userInfoCollection = db.collection(user);
            userInfoCollection.find({type: 'artist'}).toArray()
                    .then(results => {
                        //console.log(results);
                        if (results.length == 0) {
                            res.render('home', {message: 'no artists found'});
                            // console.log("artists to add");
                            // console.log(artistsToAdd);
                        } else {
                            //console.log(results);
                            async.each(results, function (artist, cb) {
                                //console.log(artist);
                                doTicketmaster(config.ticketmasterAttractionID, `&keyword=${artist.name}`)
                                    // get the attraction IDa
                                    .then(ticketmasterJSON => {
                                        //console.log("ticketmasterJSON");
                                        //console.log(ticketmasterJSON);
                                        if (ticketmasterJSON._embedded == null) {
                                            return null;
                                        } else {
                                            return ticketmasterJSON._embedded.attractions[0].id;
                                        }
                                    })
                                    // get the events for the attraction ID
                                    .then(ticketmasterID => {
                                        //console.log(ticketmasterID);
                                        if (ticketmasterID == null) {
                                            return null;
                                        } else {
                                            //console.log("do ticketmaster");
                                            //console.log(req.query.state);
                                            return doTicketmaster(config.ticketmasterEvents, `&attractionId=${ticketmasterID}&stateCode=${req.query.state}`)
                                        }
                                    })
                                    .then(events => {
                                        // render events in json object to be parsed in pug file (see index.js)
                                        if (events != null) {
                                            //console.log(events);
                                            if (events._embedded != null) {
                                                if (events._embedded.events != null) {
                                                    //console.log(events);
                                                    let j;
                                                    for (j = 0; j < 3; j++) {
                                                        if (events._embedded.events[j] != null) {
                                                            console.log(artist);
                                                            let event = {
                                                                "artistName": artist.name,
                                                                "eventTitle": events._embedded.events[j].name,
                                                                "location": events._embedded.events[j]._embedded.venues[0].city.name,
                                                                "date": events._embedded.events[j].dates.start.localDate,
                                                                "time": events._embedded.events[j].dates.start.localTime
                                                            };
                                                            userInfoCollection.find({type: 'event', artistName: event.artistName, location: event.location, date: event.date}).count()
                                                                .then(results => {
                                                                    //console.log(results);
                                                                    if(results == 0){
                                                                        event.type = 'event';
                                                                        userInfoCollection.insertOne(event)
                                                                            .then(result =>{
                                                                                //console.log(result)
                                                                            })
                                                                            .catch(error => console.error(error));
                                                                        // console.log("artists to add");
                                                                        // console.log(artistsToAdd);
                                                                    }
                                                                })
                                                                .catch(error => console.error(error));
                                                            console.log(event);
                                                            data.push(event);
                                                            //console.log(data);
                                                        }
                                                    }
                                                }
                                            } else {
                                                //console.log("embedded null");
                                            }
                                        } else {
                                            //console.log("events null");
                                        }
                                    }).catch(error => console.error(error));
                                cb();
                            }, function (err) {
                                if(err) {
                                    console.error(err);
                                }
                                res.render('home',
                                    {
                                        messageUsers: 'events added',
                                        username: user
                                    });
                            });
                        }
            })
        .catch(error => console.error(error));
        });
});
module.exports = router;