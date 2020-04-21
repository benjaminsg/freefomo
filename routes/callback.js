const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;

/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', function(req, res) {
    //get received querystring containing code and state
    var code = req.query.code || null;
    var state = req.query.state || null;
    console.log(state);
    var storedState = req.cookies ? req.cookies[config.stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(config.stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: config.redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(config.spotifyClientId + ':' + config.spotifyClientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    //console.log(body);
                });


                    var options = {
                        url: config.spotifyTopArtistsUrl,
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        json: true
                    };

                    //use the received token to make a request to Spotify for the user's top artists
                    request.get(options, function (error, response, body) {
                        //console.log(body);

                        const receivedArtists = body.items;
                        const artistList = [];
                        const jsonArtistList = [];

                        //console.log(receivedArtists);

                        for (let i=0;i<20;i++){
                            //console.log(receivedArtists[i].name);
                            artistList[i] = receivedArtists[i].name;
                            jsonArtistList.push({
                                artistName: artistList[i]
                            })
                        }

                        console.log(jsonArtistList);

                        //store the received top artists in mongodb under the received state collection (inputted username)
                        MongoClient.connect(config.connectionString, {
                            useUnifiedTopology: true
                        })
                            .then(client => {
                                console.log('Connected to Database');
                                const db = client.db('user-info');
                                const userInfoCollection = db.collection(state);
                                userInfoCollection.find({name: 'Tame Impala'}).toArray()
                                    .then(results => {
                                        console.log(results)
                                    })
                                    .catch(error => console.error(error));
                                for (let i=0;i<20;i++){
                                    userInfoCollection.insertOne({type: 'artist', name: artistList[i]})
                                        .then(result =>{
                                            console.log(result)
                                        })
                                        .catch(error => console.error(error));
                                }
                            })
                            .catch(error => console.error(error));

                        //render the resulting JSON on the pug
                        res.render('callback',
                            {title:'request received accurately!',
                                events: JSON.stringify(body)});
                    });

                // getTopArtists(config.spotifyTopArtistsUrl,config.spotifyClientId, access_token)
                //
                //         .then (topArtists => {
                //             console.log(topArtists);
                //             // render events in json object to be parsed in pug file (see index.js)
                //             res.render('callback',
                //                 {title:'request received accurately!',
                //                     events: JSON.stringify(topArtists._embedded.name)});
                //         })
                //
                //         .catch(e => {
                //             console.log(e);
                //         });

                // // we can also pass the token to the browser to make requests from there
                // res.render('callback',
                //     {title:'request received accurately!',
                //         events: JSON.stringify(body)});
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

module.exports = router;