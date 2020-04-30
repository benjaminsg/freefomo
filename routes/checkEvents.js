const express = require('express');
const fetch = require('node-fetch');
const async = require('async');
const router = express.Router();
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;

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
            userInfoCollection.find({type: 'event'}).toArray()
                .then(results => {
                    //console.log(results);
                    if (results.length == 0) {
                        res.render('users', {title: 'uh oh',
                            events: 'no artists found'});
                        // console.log("artists to add");
                        // console.log(artistsToAdd);
                    } else {
                        res.render('users',
                            {
                                title: 'Your Events',
                                events: results,
                                username: user
                            });
                    }
                })
                .catch(error => console.error(error));
        }).catch(error => console.error(error));
});

module.exports = router;