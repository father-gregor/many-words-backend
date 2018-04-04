"use strict";

const router = require('express').Router();
const randomWordsController = require("../controllers/random-words.controller");

router.route("/random").get(randomWordsController.getRandomWord);

module.exports = router;