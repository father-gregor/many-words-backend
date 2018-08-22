"use strict";

const Models = require("../database/mongoose.models");

const DailyWord = Models.DailyWord;

async function fillDailyWordsDatabase (req, res) {
    try {
        let [latestWord] = await DailyWord.find().sort({"publishDateUTC": -1}).limit(1).exec();
        if (!latestWord) {
            return res.status(500).send('Error: database empty or not working correctly');
        }
        
        let latestFilledDate = latestWord.publishDateUTC;
        return res.json({lastDate: latestFilledDate});
    } catch (err) {
        return res.status(500).send('Error: failed to fill database');
    }
}

module.exports = {
    fillDailyWordsDatabase
}