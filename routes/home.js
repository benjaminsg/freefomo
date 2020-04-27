const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/home', function(req, res, next) {
    res.render('home');
});

module.exports = router;
