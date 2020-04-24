const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const querystring = require('querystring');
const request = require('request');
const {google} = require('googleapis');
const MongoClient = require('mongodb').MongoClient;

//get oAuth tokens
const doOAuth = async (oAuth2Client, code) => {
    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    //console.log(tokens);
    return tokens;
}

// function generateHash(string) {
//     var hash = 0;
//     if (string.length === 0)
//         return hash;
//     for (let i = 0; i < string.length; i++) {
//         var charCode = string.charCodeAt(i);
//         hash = ((hash << 7) - hash) + charCode;
//         hash = hash & hash;
//     }
//     return hash;
// }

//get and store calendar tokens using querystring code and state
router.get('/', function(req, res) {
    var code = req.query.code || null;

    var usercreds = JSON.parse(req.query.state) || null;

    var user = usercreds.username;
    // var pwd = usercreds.password;

    console.log(user);
    // console.log(pwd);

    //get oAuth client parameters from config file, refer to Slack for latest config
    const oAuth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        config.googleRedirectUris[0]
    );

    //get tokens using querystring code and oAuth client
    doOAuth(oAuth2Client, code)
        .then(tokens => {
            console.log(tokens);

            //connect to mongodb and store the received tokens under username collection
            MongoClient.connect(config.connectionString, {
                useUnifiedTopology: true
            })
                .then(client => {
                    console.log('Connected to Database');
                    const db = client.db('user-info');
                    const userInfoCollection = db.collection(user);

                    const storeTokens = {type : 'tokens', content: tokens};

                    // const hashpwd = {type : 'password',
                    // content: {hashedPassword: generateHash(pwd)}};

                    // userInfoCollection.insertOne(hashpwd)
                    //     .then(result => {
                    //         //console.log(result)
                    //     })
                    //     .catch(error => console.error(error));
                    userInfoCollection.insertOne(storeTokens)
                        .then(result => {
                            //console.log(result)
                        })
                        .catch(error => console.error(error));
            })
                .catch(error => console.error(error));

            //render token JSON the pug
            res.render('callbackgoogle',
                {title:'Calendar tokens received',
                events: 'Adding artists to the calendar goes here'})
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