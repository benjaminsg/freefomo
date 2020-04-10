const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');
const request = require('request');
const {google} = require('googleapis');

const doOAuth = async (oAuth2Client, code) => {
    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    //console.log(tokens);
    return tokens;
}

/* integrates spotify artist & current location w/ ticketmaster API to get events */
router.get('/', function(req, res) {
    var code = req.query.code || null;

    const oAuth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        config.googleRedirectUris[0]
    );

    doOAuth(oAuth2Client, code)
        .then(tokens => {
            console.log(tokens);
            res.render('callbackgoogle',
                {title:'request received accurately!',
                events: JSON.stringify(tokens)})
        })
        .catch(e => {
            console.log(e);
        });


    // oAuth2Client.on('tokens', (tokens) => {
    //    if(tokens.refresh_token) {
    //        console.log(tokens.refresh_token);
    //    }
    //    console.log(tokens.access_token);
    // })
});

module.exports = router;