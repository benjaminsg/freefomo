const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(config.stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: config.spotifyClientId,
            //scope: scope,
            redirect_uri: config.redirectUri,
            state: state
        }));
});

module.exports = router;