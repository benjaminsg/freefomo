const express = require('express');
const router = express.Router();
/* welcome log-in page */
router.get('/', function(req, res, next) {
    res.render('welcome',
        { title: 'log-in' });
});

module.exports = router;
