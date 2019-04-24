"use strict";

const express = require("express");
const path = require("path");
// const favicon = require("serve-favicon");
const logger = require("morgan");
const bodyParser = require("body-parser");
// const request = require("request");

// Load .env file for local development
require("dotenv").config();

const mongoDb = require("./src/database/mongodb.connection");

mongoDb.connectToDb();

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    return res.status(err.status || 500).send(req.app.get("env") === "development" ? err : {});
});

module.exports = app;
