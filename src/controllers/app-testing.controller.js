"use strict";

const Models = require("../database/mongoose.models");
const predefinedWords = require("../../config/daily-word.values.json").words;

const DailyWord = Models.DailyWord;

async function fillDatabase (req, res) {
    try {
        for (let i = 0; i < predefinedWords.length; i++) {
            predefinedWords[i].publishDateUTC = _createUTCDate(predefinedWords[i].publishDateUTC);
        }
        await DailyWord.create(predefinedWords);
    
        let dailyWords = await DailyWord.find().exec();
        res.json(dailyWords);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

/**
 * Convert string to UTC date. String date can be only in format of "dd.mm.YYYY"
 * @param {*} stringDate 
 */
function _createUTCDate (stringDate) {
    let result = stringDate.split(".");
    let Year = parseInt(result[2]);
    let Month = parseInt(result[1]) - 1;
    let DayOfMonth = parseInt(result[0]);
    return new Date(Date.UTC(Year, Month, DayOfMonth));
}

module.exports = {
    fillDatabase
};