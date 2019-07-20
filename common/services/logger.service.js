"use strict";

const {stringify} = require("flatted/cjs");

const Models = require("../models");

const Log = Models.Log;

async function log (type, message, meta) {
    const isErrorMeta = meta instanceof Error;
    if (isErrorMeta) {
        meta = {...meta, message: meta.message, stack: meta.stack};
    }

    meta = stringify(meta)
    if (process.env.NODE_ENV === "development") {
        console.log({type, message, meta});  // eslint-disable-line
    }

    return Log.create({
        type,
        message,
        meta
    });
}

module.exports = {
    info: async (message, details) => log("info", message, details),
    warning: async (message, warning) => log("warning", message, warning),
    error: async (message, error) => log("error", message, error)
};
