"use strict";

const mongoose = require("mongoose");

const Logger = require("../common/services/logger.service");
// const schemas = require("./mongoose.models");

module.exports = {
    connectToDb: () => {
        let mongoURI = process.env.MONGODB_URI;
        let connectionOptions = {
            keepAlive: 300000,
            connectTimeoutMS: 30000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        mongoose.Promise = Promise;
        mongoose.connect(mongoURI, connectionOptions);
        mongoose.set("useCreateIndex", true);
        let db = mongoose.connection;

        db.on("error", (error) => {
            Logger.error("MongoDB Connection Error", error);
        });
    }
};
