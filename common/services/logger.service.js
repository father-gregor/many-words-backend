"use strict";

const Models = require("../models");

const Log = Models.Log;

async function log (type, message, details) {
    if (details instanceof Error) {
        details = {...details, message: details.message, stack: details.stack};
    }

    if (process.env.NODE_ENV === "development") {
        console.log({type, message, details});  // eslint-disable-line
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
