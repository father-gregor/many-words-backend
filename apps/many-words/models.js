"use strict";

const mongoose = require("mongoose");

const DailyWordSchema = require("./src/schemas/daily-word.schema");

module.exports = {
    DailyWord: mongoose.model("daily-word", DailyWordSchema)
};
