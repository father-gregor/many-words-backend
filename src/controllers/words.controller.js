"use strict";

const rpn = require("request-promise-native");
const cheerio = require("cheerio");
const natural = require("natural");

const Models = require("../database/mongoose.models");
const appValues = require("../../config/app.values.json");
const Utils = require("../services/utils.service");
const Logger = require("../services/logger.service");
const ExternalApi = require("../../config/external-api.values.json");
const profanitiesValues = require("../../config/profanities.json");

const DailyWord = Models.DailyWord;

const ProfanitiesTrie = new natural.Trie();
ProfanitiesTrie.addStrings(profanitiesValues);

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
        let wildcard = "";
        let result = [];
        const count = parseInt(req.query.count, 10);
        const maxTries = count + appValues.randomWords.maxApiRepeat;
        let min = appValues.randomWords.wildcard.min;
        let max = appValues.randomWords.wildcard.max;

        const start = Utils.timer();
        for (let tries = 0; tries < maxTries; tries++) {
            let wildcardLength = Utils.getRandomInt(min, max);
            // TODO Optimize process to append two-three symbols prefix for more randomized result
            for (let i = 0; i < wildcardLength; i++) {
                wildcard = `${wildcard}?`;
            }
            let randomWords = await rpn.get({
                url: ExternalApi.randomWords.url,
                qs: {
                    sp: wildcard,
                    md: "d"
                },
                json: true
            });
            let finalRandomWord = randomWords[Utils.getRandomInt(0, randomWords.length)];

            if (finalRandomWord && finalRandomWord.word && finalRandomWord.defs) {
                result.push({
                    name: finalRandomWord.word,
                    definitions: finalRandomWord.defs.map(def => Utils.cleanWordDefinition(def)),
                    publishDateUTC: new Date()
                });
            }

            if (result.length >= count) {
                tries = maxTries;
            }
        }
        console.log("TIME", Utils.timer(start));
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
        const count = parseInt(req.query.count, 10);
        const maxTries = count + appValues.memeWords.maxApiRepeat;

        for (let tries = 0; tries < maxTries; tries++) {
            let query = {};
            let paramName = ExternalApi.memeWords.queryParams.name;
            let paramValue = ExternalApi.memeWords.queryParams.value;
            query[paramName] = Utils.getRandomInt(paramValue, paramValue * 10);

            // If we define "page" value bigger than 1000 (that value maybe going to change or increase in future) every request would give us random word
            let html = await rpn.get({
                url: ExternalApi.memeWords.url,
                qs: query
            });

            let word = {definitions: []};
            let $ = cheerio.load(html);

            $("a.word").each((i, elem) => {
                let name = $(elem).text().trim();
                if (name && !ProfanitiesTrie.contains(name)) {
                    word.name = name;
                    return false;
                }

                return true;
            });

            $("div.meaning").each((i, elem) => {
                let definition = $(elem).text().trim();
                if (definition && !ProfanitiesTrie.contains(definition)) {
                    word.definitions.push(definition);
                    if (word.definitions.length > 3) {
                        return false;
                    }
                }

                return true;
            });

            if (word.name && word.definitions.length > 0) {
                result.push({
                    ...word,
                    publishDateUTC: new Date()
                });
            }

            if (result.length >= count) {
                tries = maxTries;
            }
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
