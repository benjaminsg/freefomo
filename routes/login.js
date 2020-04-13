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

/* Sends request to authenticate Spotify account and redirects to received authentication URL with username in state fragment */
router.get('/', function(req, res) {
    var state = req.query.username;//generateRandomString(16);
    res.cookie(config.stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-top-read';
    var redirectUrl = 'https://accounts.spotify.com/authorize?' +
        // create querystring containing request details, refer to Slack for latest config file
        querystring.stringify({
            response_type: 'code',
            client_id: config.spotifyClientId,
            scope: scope,
            redirect_uri: config.redirectUri,
            state: state
        });
    console.log(redirectUrl);
    // redirect in browser so the user can authenticate the app to access their Spotify information, then redirect to callback URI
    res.redirect(redirectUrl);
});

module.exports = router;