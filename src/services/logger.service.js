"use strict";

const Models = require("../database/mongoose.models");

const Log = Models.Log;

async function log (type, message, details) {
    if (details instanceof Error) {
        details = {...details, message: details.message, stack: details.stack};
    }

    return Log.create({
        type,
        message,
        details
    });
}

module.exports = {
    info: async (message, details) => log("info", message, details),
    warning: async (message, warning) => log("warning", message, warning),
    error: async (message, error) => log("error", message, error)
};
