const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res, next) {

  const MongoClient = require('mongodb').MongoClient;

  const url = config.connectionString;
  const user = req.query.username;

  const doTicketmaster = async (url, value) => {
    let returnValueRaw = await fetch(url + value);
    let returnValue = await returnValueRaw.json();
    return returnValue;
  };

// Use connect method to connect to the Server
  MongoClient.connect(url, { useUnifiedTopology: true})
      .then(client => {
        console.log('Connected to Database');

        let spotifyArtists = [];

        const db = client.db('user-info');
        db.collection(user).find({type : "artist"}).toArray()
            .then(result => {
              /* gets 3 artists from a user's top artists */
              spotifyArtists.push(result[0].name);
              spotifyArtists.push(result[1].name);
              spotifyArtists.push(result[2].name);
              return spotifyArtists;
            })

              .then(artists => {
                let artistIDs = ['-1', '-1', '-1'];
                // get attractionID for artist 1
                doTicketmaster(config.ticketmasterAttractionID, `&keyword=${spotifyArtists[0]}`)
                    // save the attractionID for artist 1
                    .then(ticketmasterJSON => {
                        if(ticketmasterJSON != null && ticketmasterJSON._embedded != null) {
                            artistIDs[0] = ticketmasterJSON._embedded.attractions[0].id;
                        }
                    });

                // get attractionID for artist 2
                doTicketmaster(config.ticketmasterAttractionID, `&keyword=${spotifyArtists[1]}`)
                    // save the attractionID for artist2
                    .then(ticketmasterJSON => {
                        if(ticketmasterJSON != null && ticketmasterJSON._embedded != null) {
                            artistIDs[1] = ticketmasterJSON._embedded.attractions[0].id;
                        }
                    });

                // get attractionID for artist 3
                doTicketmaster(config.ticketmasterAttractionID, `&keyword=${spotifyArtists[2]}`)
                    // save the attractionID for artist3
                    .then(ticketmasterJSON => {
                        if(ticketmasterJSON != null && ticketmasterJSON._embedded != null) {
                            artistIDs[2] = ticketmasterJSON._embedded.attractions[0].id;
                        }

                      /* the return statement may have to be here, i'm not sure */
                    });
                return artistIDs;
              })
                .then(pplIDs => {
                  let events = [];
                  console.log(pplIDs[0], pplIDs[1], pplIDs[2]);

                  // get JSON events for artist 1 and add them to list
                  doTicketmaster(config.ticketmasterEvents,`&attractionId=${pplIDs[0]}&${req.query.state}`)
                      .then(res => {
                        events[0] = res;
                      });

                  // get JSON events for artist 2 and add them to list
                  doTicketmaster(config.ticketmasterEvents,`&attractionId=${pplIDs[1]}&${req.query.state}`)
                      .then(res => {
                        events[1] = res;
                      });

                  // get JSON events for artist 1 and add them to list
                  doTicketmaster(config.ticketmasterEvents,`&attractionId=${pplIDs[2]}&${req.query.state}`)
                      .then(res => {
                        events[2] = res;
                        /* the return statement may have to be here, i'm not sure */
                      });
                  console.log(events);
                  return events;
                })

      })
      .catch(e => {
        console.log(e);// catch error
      })
});
module.exports = router;
