"use strict";

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
        if (!words || !Array.isArray(words)) {
            return res.status(404).send();
        }

        return res.json(words);
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

            const results = await Promise.all(randomWordPromises.map(p => p.catch(e => e)));
            let randomWords = results.filter(r => !(r instanceof Error));
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

        const synonymsPromises = [];
        for (let word of result) {
            synonymsPromises.push(WordFetcher.requestWordSynonyms(word.name).then((synonyms) => {
                if (synonyms) {
                    word.synonyms = synonyms;
                }
            }));
        }
        await Promise.all(synonymsPromises);

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
 * @param {Boolean} req.query.checkProfanities - if present word and definitions would be checked for profanities
 * @param {*} res
 */
async function getMemeWord (req, res) {
    try {
        let results = [];
        const count = req.query.count;
        const checkProfanities = req.query.checkProfanities;
        let maxTries = appValues.memeWords.maxApiRepeat;
        let resultFilled = false;

        while (maxTries > 0) {
            let memeWordPromises = [];
            for (let i = 0; i < count; i++) {
                memeWordPromises.push(WordFetcher.requestMemeWord());
            }

            const promisesResults = await Promise.all(memeWordPromises.map(p => p.catch((e) => {
                Logger.error("Failed to fetch meme word", e);
                return e;
            })));

            const memeWords = promisesResults.filter(r => !(r instanceof Error));
            for (let memeWord of memeWords) {
                if (results.length >= count) {
                    resultFilled = true;
                    break;
                }

                const isProhibitedWord = checkProfanities && (WordUtils.checkForProfanities(memeWord.word) || WordUtils.checkForProfanities(memeWord.definition));
                if (results.find(v => v.word === memeWord.word) || isProhibitedWord) {
                    continue;
                }

                results.push({
                    ...memeWord,
                    publishDateUTC: new Date()
                });
            }

            if (resultFilled) {
                break;
            }
            maxTries--;
        }
        return res.json(results);
    } catch (err) {
        Logger.error(err.message, err.response ? {
            type: err.type,
            error: err.error,
            message: err.message,
            statusCode: err.statusCode,
            options: {
                url: err.options.url,
                method: err.options.method,
                qs: JSON.stringify(err.options.qs)
            }
        } : err);

        return res.status(500).send();
    }
}

module.exports = {
    getDailyWord,
    getRandomWord,
    getMemeWord
};
