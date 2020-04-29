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

router.get('/', function(req, res) {
    var user = req.query.username;
    var pwd = req.query.password;
    var confirmpwd = req.query.confirmPassword;


    if(pwd != confirmpwd){
        res.render('register', {message: "passwords do not match"});
    } else if (user.length == 0) {
        res.render('register', {message: "username cannot be empty"});
    } else {

        console.log(user);
        console.log(pwd);

        //connect to mongodb and store the received tokens under username collection
        MongoClient.connect(config.connectionString, {
            useUnifiedTopology: true
        })
            .then(client => {
                console.log('Connected to Database');
                const db = client.db('user-info');
                const userInfoCollection = db.collection(user);

                const hashpwd = {
                    type: 'password',
                    content: {hashedPassword: generateHash(pwd)}
                };

                userInfoCollection.insertOne(hashpwd)
                    .then(result => {
                        //console.log(result)
                    })
                    .catch(error => console.error(error));
            })
            .catch(error => console.error(error));

        //render token JSON the pug
        res.render('index', {message: "account creation successful"});
    }
});

module.exports = router;
