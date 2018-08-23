"use strict";

const Models = require("../database/mongoose.models");
const wordsCollector = require("./words-collector.controller")

const DailyWord = Models.DailyWord;

async function fillDailyWordsDatabase (req, res) {
    try {
        let collectedWords
        try {
            collectedWords = await wordsCollector.collect({wordsCount: 30});
            if (!collectedWords) {
                return res.status(500).send("Error: Failed to collect words");
            }
        } catch (err) {
            return res.status(500).send("Error: Failed to collect words");
        }

        let [latestWord] = await DailyWord.find().sort({"publishDateUTC": -1}).limit(1).exec();
        if (!latestWord) {
            return res.status(500).send("Error: Database empty or not working correctly");
        }
        
        let latestFilledDate = latestWord.publishDateUTC;
        return res.json({lastDate: latestFilledDate});
    } catch (err) {
        return res.status(500).send("Error: Failed to fill database");
    }
}

module.exports = {
    fillDailyWordsDatabase
}