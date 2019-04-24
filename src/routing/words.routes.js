"use strict";

const wordsController = require("../controllers/words.controller");
const databaseController = require("../controllers/database.controller");

module.exports = function (app) {
    app.get("/api/words/daily", wordsController.getDailyWord);
    app.get("/api/words/random", wordsController.getRandomWord);
    app.get("/api/words/meme", wordsController.getMemeWord);
    app.get("/api/words/fill-database", databaseController.fillDailyWordsDatabase);
};
