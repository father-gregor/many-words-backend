"use strict";

const router = require("express").Router();
const wordsController = require("../controllers/words.controller");
const databaseController = require("../controllers/database.controller");

router.route("/daily").get(wordsController.getDailyWord);
router.route("/random").get(wordsController.getRandomWord);
router.route("/meme").get(wordsController.getMemeWord);

router.route("/fill-database").get(databaseController.fillDailyWordsDatabase);

module.exports = router;