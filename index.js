"use strict";

const express = require("express");
const path = require("path");
// const favicon = require("serve-favicon");
const logger = require("morgan");
const bodyParser = require("body-parser");

// Load .env file for local development
require("dotenv").config();

const mongoDb = require("./database/mongodb.connection");

mongoDb.connectToDb();

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(express.static(path.join(__dirname, "dist")));

app.disable("x-powered-by");

app.use((req, res, next) => {
    res.set("Cache-Control", "max-age=2592000");
    next();
});

app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Init apps
require("./apps/many-words/app")(app);

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }
    return res.sendFile(path.join(__dirname, "index.html"));
});

app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res) => res.status(err.status || 500).send(req.app.get("env") === "development" ? err : {}));

module.exports = app;
