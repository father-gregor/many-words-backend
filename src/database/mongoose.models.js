const mongoose = require("mongoose");
const DailyWordSchema = require("../schemas/daily-word.schema");

module.exports = {
    DailyWord: mongoose.model("daily-word", DailyWordSchema)
};