"use strict";

const Models = require("../database/mongoose.models");
const predefinedWords = require("../../config/daily-word.values.json").words;
const utils = require("../utils/utils");

const DailyWord = Models.DailyWord;

async function fillDatabase (req, res) {
    try {
        for (let i = 0; i < predefinedWords.length; i++) {
            predefinedWords[i].publishDateUTC = utils.createUTCDate(predefinedWords[i].publishDateUTC);
        }
        await DailyWord.create(predefinedWords);
    
        let dailyWords = await DailyWord.find().exec();
        console.log(dailyWords);
    
        res.json(dailyWords);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

module.exports = {
    fillDatabase
};