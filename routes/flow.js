const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

router.get('/', function(req, res) {
    var user = req.query.username;
    MongoClient.connect(config.connectionString, {
        useUnifiedTopology: true
    })
        .then(client => {
            console.log('Connected to Database');

            const db = client.db('user-info');
            const userInfoCollection = db.collection(user);

            userInfoCollection.find({type: 'tokens'}).toArray()
                .then(result => {
                    if(result.length == 0){
                        console.log("No Google account synced");
                        res.render('home',
                            {message: "No Google account synced"});
                    } else {
                        const oAuth2Client = new google.auth.OAuth2(
                            config.googleClientId, config.googleClientSecret, config.googleRedirectUris[0]);
                        const token = result[0].content.access_token;
                        oAuth2Client.setCredentials(token);
                        const calendar = google.calendar({version: 'v3', oAuth2Client});
                        calendar.events.list({
                            calendarId: 'primary',
                            timeMin: (new Date()).toISOString(),
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime',
                        }, (err, res) => {
                            if (err) return console.log('The API returned an error: ' + err);
                            const events = res.data.items;
                            if (events.length) {
                                console.log('Upcoming 10 events:');
                                events.map((event, i) => {
                                    const start = event.start.dateTime || event.start.date;
                                    console.log(`${start} - ${event.summary}`);
                                });
                            } else {
                                console.log('No upcoming events found.');
                            }
                        });
                        res.render('index',
                            {message: "success"});
                    }

                })
                .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
});

module.exports = router;