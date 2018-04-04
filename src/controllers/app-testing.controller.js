"use strict";

const Models = require("../database/mongoose.models");

const DailyWord = Models.DailyWord;

async function testDatabaseConnection (req, res) {
    try {
        await DailyWord.create({
            word: "silage",
            definition: "Fodder prepared by storing and fermenting green forage plants in a silo",
            language: "en",
            publishDateUTC: new Date(Date.UTC(2018, 4, 5))
        });
    
        let dailyWords = await DailyWord.find().exec();
        console.log(dailyWords);
    
        res.json(dailyWords);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

module.exports = {
    testDatabaseConnection
};