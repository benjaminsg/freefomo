const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');
const request = require('request');

/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
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
                    console.log(body);
                });


                    var options = {
                        url: config.spotifyTopArtistsUrl,
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        json: true
                    }

                    request.get(options, function (error, response, body) {
                        console.log(body);
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