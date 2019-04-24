"use strict";

const mongoose = require("mongoose");

const Logger = require("../services/logger.service");
// const schemas = require("./mongoose.models");

module.exports = {
    connectToDb: () => {
        let mongoURI = process.env.MONGODB_URI;
        let connectionOptions = {
            server: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            },
            replset: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            },
            useNewUrlParser: true
        };

        mongoose.Promise = Promise;
        mongoose.connect(mongoURI, connectionOptions);
        let db = mongoose.connection;

        db.on("error", (error) => {
            Logger.error("MongoDB Connection Error", error);
        });
    }
};
