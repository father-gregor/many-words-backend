const mongoose = require("mongoose");

const DailyWordSchema = new mongoose.Schema({
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
});

function transformJson (doc, ret) {
    delete ret.__v;
}

DailyWordSchema.set('toJSON', {transform: transformJson});

module.exports = new mongoose.Schema(DailyWordSchema);