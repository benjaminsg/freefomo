// const express = require('express');
// const fetch = require('node-fetch');
// const router = express.Router();
// const config = require('../config');
// const querystring = require('querystring');
//
// const doSpotifySignin = async (url, value) => {
//     let returnValueRaw = await fetch(url + value + '&redirect_uri=localhost:3000&response_type=token', {method: 'GET'});
//     // let returnValue = await querystring.parse(returnValueRaw);
//     let returnValue = await returnValueRaw.url;
//     return returnValue;
// };
//
// const getTopArtists = async (url, value, token) => {
//
//     var headers = {
//         "Authorization" : token
//     }
//
//     let returnValueRaw = await fetch(url + value, {method: 'GET', headers: headers});
//     let returnValue = await returnValueRaw.json();
//     return returnValue;
// };
//
// /* integrates spotify artist & current location w/ ticketmaster API to get events */
// router.get('/', function(req, res, next) {
//     console.log(req.query.title);
//     doSpotifySignin(config.spotifyAuthenticateUrl, config.spotifyClientId)
//
//         // get the events for the attraction ID
//         .then (spotifyUserToken => {
//             console.log(spotifyUserToken);
//             return getTopArtists(config.spotifyTopArtistsUrl,config.spotifyClientId, spotifyUserToken);
//         })
//
//         .then (topArtists => {
//             console.log();
//             // render events in json object to be parsed in pug file (see index.js)
//             res.render('users',
//                 {title:'request received accurately!',
//                     events: JSON.stringify(topArtists._embedded.name)});
//         })
//
//         .catch(e => {
//             console.log(e);
//         })
// });
//
// module.exports = router;
