const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();

router.get("/", function(req, res)  {
    res.render("login");
});

module.exports = router;