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
const apiTestingRoutes = require("./src/routing/app-testing.routes");
const wordsRoutes = require("./src/routing/words.routes");

mongoDb.connectToDb();

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(express.static(path.join(__dirname, "dist")));

app.use("/api/testing", apiTestingRoutes);
app.use("/api/words", wordsRoutes);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.status(err.status || 500).send(req.app.get("env") === "development" ? err : {});
});

module.exports = app;
