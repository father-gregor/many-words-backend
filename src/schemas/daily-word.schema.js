const mongoose = require("mongoose");

const DailyWordSchema = {
    word: {
        type: String,
        required: true,
        lowercase: true
    },
    definition: {
        type: String,
        required: true,
        lowercase: true
    },
    language: {
        type: String,
        enum: ["en"],
        required: true
    },
    publishDateUTC: {
        type: Date,
        required: true
    },
    publishTimeUTC: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
};

module.exports = new mongoose.Schema(DailyWordSchema);