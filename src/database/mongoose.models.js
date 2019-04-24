const mongoose = require("mongoose");

const DailyWordSchema = require("../schemas/daily-word.schema");
const LogSchema = require("../schemas/log.schema");

module.exports = {
    DailyWord: mongoose.model("daily-word", DailyWordSchema),
    Log: mongoose.model("log", LogSchema)
};
