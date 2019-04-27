"use strict";

const mongoose = require("mongoose");

const LogSchema = require("./schemas/log.schema");

module.exports = {
    Log: mongoose.model("log", LogSchema)
};
