const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();

router.get("/", function(req, res)  {
    res.render("home",
        {username: req.query.username});
});

module.exports = router;