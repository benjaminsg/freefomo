const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config');
const MongoClient = require('mongodb').MongoClient;

function generateHash(string) {
    var hash = 0;
    if (string.length === 0)
        return hash;
    for (let i = 0; i < string.length; i++) {
        var charCode = string.charCodeAt(i);
        hash = ((hash << 7) - hash) + charCode;
        hash = hash & hash;
    }
    return hash;
}

router.get("/", function(req, res) {
    var user = req.query.username || null;
    var pwd = req.query.password || null;

    MongoClient.connect(config.connectionString, {
        useUnifiedTopology: true
    })
        .then(client => {
            console.log('Connected to Database');

            const db = client.db('user-info');
            const userInfoCollection = db.collection(user);

            const hashpwd = {type : 'password',
                content: {hashedPassword: generateHash(pwd)}};

            userInfoCollection.find({type: 'password'}).toArray()
                .then(result => {
                    //console.log(result[0]);
                    if(generateHash(pwd) == result[0].content.hashedPassword){
                        console.log("passwords match");
                        res.render('home', {message: "login successful",
                                            username:user})
                    } else {
                        console.log("passwords do not match");
                        res.render('index',
                            {message: "login unsuccessful"})
                    }

                })
                .catch(error => console.error(error));
        })
        .catch(error => console.error(error));

});

module.exports = router;