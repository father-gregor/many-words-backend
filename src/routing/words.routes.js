"use strict";

const app = require("express");
const wordsController = require("../controllers/words.controller");
const databaseController = require("../controllers/database.controller");

app.route("/api/words/daily").get(wordsController.getDailyWord);
app.route("/api/words/random").get(wordsController.getRandomWord);
app.route("/api/words/meme").get(wordsController.getMemeWord);
app.route("/api/words/fill-database").get(databaseController.fillDailyWordsDatabase);
