"use strict";

const wordsController = require("../controllers/words.controller");
const databaseController = require("../controllers/database.controller");

const wordsMiddleware = require("../middlewares/words.middleware");

module.exports = function (app) {
    app.get("/api/words/daily", wordsMiddleware.validateQueryParams, wordsController.getDailyWord);
    app.get("/api/words/random", wordsMiddleware.validateQueryParams, wordsController.getRandomWord);
    app.get("/api/words/meme", wordsMiddleware.validateQueryParams, wordsController.getMemeWord);
    app.get("/api/words/fill-database", databaseController.fillDailyWordsDatabase);
};
