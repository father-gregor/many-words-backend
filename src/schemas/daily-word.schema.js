"use strict";

const mongoose = require("mongoose");
const appValues = require("../../config/app.values.json");

const DailyWordSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        dropDups: true,
        lowercase: true
    },
    definitions: [{
        type: String,
        required: true,
        lowercase: true
    }],
    language: {
        type: String,
        enum: ["en"],
        required: true
    },
    partOfSpeech: [{
        type: String,
        enum: appValues.dailyWords.partOfSpeech
    }],
    publishDateUTC: {
        type: Date,
        required: true
    },
    archaic: {
        type: Boolean,
        default: false
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

module.exports = DailyWordSchema;