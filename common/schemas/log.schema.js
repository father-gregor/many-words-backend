"use strict";

const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["info", "warning", "error"],
        required: true
    },
    message: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

function transformJson (doc, ret) {
    delete ret.__v;
}

LogSchema.set("toJSON", {transform: transformJson});

module.exports = LogSchema;
