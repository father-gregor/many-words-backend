"use strict";

const Models = require("../../models");
const Logger = require("../../../../common/services/logger.service");
const WordCollector = require("../services/word-collector.service");

const DailyWord = Models.DailyWord;

/**
 * To delete records with wrong data
 * await DailyWord.deleteMany({"publishDateUTC": {$gt: new Date("2018-04-30T00:00:00.000Z")}});
 */

async function fillDailyWordsDatabase (req, res) {
    let collectedWords;
    if (!req.query.secret || req.query.secret !== process.env.SECRET) {
        return res.status(403).send("Don't even try if you forgot our secret");
    }
    try {
        collectedWords = await WordCollector.collect({wordsCount: 30});
        if (!collectedWords) {
            throw new Error("Error: No words collected");
        }
    } catch (err) {
        Logger.error(err.message, err);
        return res.status(500).send("Error: Failed to collect words");
    }

    try {
        let [latestWord] = await DailyWord.find().sort({publishDateUTC: -1}).limit(1).exec();
        if (!latestWord) {
            return res.status(500).send("Error: Database empty or not working correctly");
        }

        let latestFilledDate = new Date(latestWord.publishDateUTC.toUTCString());
        for (let word of collectedWords) {
            latestFilledDate.setUTCDate(latestFilledDate.getUTCDate() + 1);
            word.publishDateUTC = new Date(latestFilledDate.toUTCString());
        }

        let docs = await DailyWord.create(collectedWords);

        return res.json(docs);
    } catch (err) {
        Logger.error(err.message, err);
        return res.status(500).send();
    }
}

module.exports = {
    fillDailyWordsDatabase
};
