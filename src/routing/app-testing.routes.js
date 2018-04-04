"use strict";

const router = require('express').Router();
const appTestingController = require("../controllers/app-testing.controller");

router.route("/db").get(appTestingController.testDatabaseConnection);

module.exports = router;