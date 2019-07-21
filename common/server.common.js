// Load .env file for local development
require("dotenv").config();

const mongoDb = require("../database/mongodb.connection");

mongoDb.connectToDb();
