"use strict";

const router = require('express').Router();
const wordsController = require("../controllers/words.controller");

router.route("/random").get(wordsController.getRandomWord);
router.route("/meme").get(wordsController.getMemeWord);

module.exports = router;