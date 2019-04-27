"use strict";

const cheerio = require("cheerio");

const Models = require("../../models");
const appValues = require("../../config/app.values.json");
const Utils = require("../services/utils.service");
const Logger = require("../../../../common/services/logger.service");
const WordUtils = require("../services/word-utils.service");
const WordFetcher = require("../services/word-fetcher.service");

const DailyWord = Models.DailyWord;

/**
 * Function to get daily word. Word is returned for date that user has right now - ignoring actual timezone
 * @param {*} req
 * @param {String} req.query.date - date of word to return
 * @param {String} req.query.count - count of words to return
 * @param {*} res
 */
async function getDailyWord (req, res) {
    try {
        let query = {};

        if (req.query.date && Number.isNaN(Date.parse(req.query.date)) === false) {
            let reqDate = new Date(req.query.date);
            let formatDate = new Date();
            formatDate.setUTCMilliseconds(0);
            formatDate.setUTCSeconds(0);
            formatDate.setUTCMinutes(0);
            formatDate.setUTCDate(reqDate.getDate());
            formatDate.setUTCMonth(reqDate.getMonth());
            formatDate.setUTCFullYear(reqDate.getFullYear());

            query.publishDateUTC = {
                $lte: formatDate
            };
        } else {
            return res.status(400).send();
        }

        let words = await DailyWord.find(query).sort({publishDateUTC: -1}).limit(parseInt(req.query.count, 10) || 1).exec();
        if (words && Array.isArray(words)) {
            return res.json(words);
        }

        return res.status(404).send();
    } catch (err) {
        Logger.error(err.message, err);
        return res.status(500).send();
    }
}

/**
 * Query params:
 *      sp - "spelled like" words. To simulate randomness we provide random number (in some range) of wildcard symbols "?"
 * @param {*} req
 * @param {String} req.query.count - count of words to return
 * @param {*} res
 */
async function getRandomWord (req, res) {
    try {
        let result = [];
        const count = req.query.count;
        let maxTries = appValues.randomWords.maxApiRepeat;
        let resultFilled = false;

        while (maxTries > 0) {
            let randomWordPromises = [];
            for (let i = 0; i < count; i++) {
                randomWordPromises.push(WordFetcher.requestRandomWord());
            }

            let randomWords = await Promise.all(randomWordPromises);
            for (let randomWord of randomWords) {
                if (result.length >= count) {
                    resultFilled = true;
                    break;
                }

                if (randomWord && randomWord.word && randomWord.defs && randomWord.defs.length > 0) {
                    result.push({
                        name: randomWord.word,
                        definitions: randomWord.defs.map(Utils.cleanWordDefinition),
                        publishDateUTC: new Date()
                    });
                }
            }

            if (resultFilled) {
                break;
            }
            maxTries--;
        }
        return res.json(result);
    } catch (err) {
        Logger.error(err.message, err);
        return res.status(500).send();
    }
}

/**
 * Query params:
 * @param {*} req
 * @param {String} req.query.count - count of words to return
 * @param {*} res
 */
async function getMemeWord (req, res) {
    try {
        let result = [];
        const count = req.query.count;
        const checkProfanities = req.query.checkProfanities;
        let maxTries = appValues.memeWords.maxApiRepeat;
        let resultFilled = false;

        while (maxTries > 0) {
            let memeWordPromises = [];
            for (let i = 0; i < count; i++) {
                memeWordPromises.push(WordFetcher.requestMemeWord());
            }

            let memeWords = await Promise.all(memeWordPromises);
            for (let memeWord of memeWords) {
                if (result.length >= count) {
                    resultFilled = true;
                    break;
                }

                let $ = cheerio.load(memeWord);
                let word = {definitions: []};

                $("a.word").each((i, elem) => {
                    let name = $(elem).text().trim();
                    if (name) {
                        const allowed = checkProfanities ? !WordUtils.checkForProfanities(name) : true;
                        if (allowed) {
                            word.name = name;
                            return false;
                        }
                    }

                    return true;
                });

                $("div.meaning").each((i, elem) => {
                    let definition = $(elem).text().trim();
                    if (definition) {
                        const allowed = checkProfanities ? !WordUtils.checkForProfanities(definition) : true;
                        if (allowed) {
                            word.definitions.push(definition);
                        }
                    }
                    if (word.definitions.length > 3) {
                        return false;
                    }

                    return true;
                });

                if (word.name && word.definitions.length > 0) {
                    result.push({
                        ...word,
                        publishDateUTC: new Date()
                    });
                }
            }

            if (resultFilled) {
                break;
            }
            maxTries--;
        }
        return res.json(result);
    } catch (err) {
        Logger.error(err.message, err);
        return res.status(500).send();
    }
}

module.exports = {
    getDailyWord,
    getRandomWord,
    getMemeWord
};
