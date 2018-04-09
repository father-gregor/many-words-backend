"use strict";

const rpn = require("request-promise-native");
const striptags = require("striptags");
const Models = require("../database/mongoose.models");
const appValues = require("../../config/app.values.json");
const utils = require("../utils/utils");
const ExternalApi = require("../../config/external-api.values.json");

const DailyWord = Models.DailyWord;

/**
 * Function to get daily word. Word is returned for date that user has right now - ignoring actual timezone
 * @param {*} req
 * @param {String} req.query.date - date of word to return. 
 * @param {*} res 
 */
async function getDailyWord (req, res) {
    try {
        let query = {};
        
        if (req.query.date && isNaN(Date.parse(req.query.date)) == false) {
            let reqDate = new Date (req.query.date);
            let formatDate = new Date();
            formatDate.setUTCMilliseconds(0);
            formatDate.setUTCSeconds(0);
            formatDate.setUTCMinutes(0);
            formatDate.setUTCDate(reqDate.getDate());
            formatDate.setUTCMonth(reqDate.getMonth());
            formatDate.setUTCFullYear(reqDate.getFullYear());
            query["publishDateUTC"] = {
                $lte: formatDate
            };
        }
        else {
            return res.status(400).send();
        }

        let words = await DailyWord.find(query).exec();
        if (words && Array.isArray(words)) {
            words.sort((wordX, wordY) => {
                return wordY.publishDateUTC - wordX.publishDateUTC;
            });
            return res.json(words[0]);
        } else {
            return res.status(404).send();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

/**
 * Query params: 
 *      sp - "spelled like" words. To simulate randomness we provide random number (in some range) of wildcard symbols "?"
 * @param {*} req 
 * @param {*} res 
 */
async function getRandomWord (req, res) {
    try {
        let wildcard = "";
        let min = appValues.randomWords.wildcard.min;
        let max = appValues.randomWords.wildcard.max;
        let wildcardLength = utils.getRandomInt(min, max);

        // TODO Optimize process to append two-three symbols prefix for more randomized result
        for (let i = 0; i < wildcardLength; i++) {
            wildcard = wildcard + "?";
        }
        let randomWords = await rpn.get({
            url: ExternalApi.randomWords.url,
            qs: {
                sp: wildcard,
                md: "d"
            },
            json: true
        });
        let finalRandomWord = randomWords[utils.getRandomInt(0, randomWords.length)];

        res.json({
            word: finalRandomWord.word,
            def: _getWordDefinition(finalRandomWord.defs[0]),
            t: new Date().toUTCString()
        });
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

async function getMemeWord (req, res) {
    try {
        //Zero group - complete result, first group - word, second group - definition
        let memeWordRegExp = /<a class="word".+?>(.+?)<\/a>.+<div class="meaning".*?>(.+?)<\/div>/mi;

        for (let tries = 0; tries < appValues.memeWords.maxApiRepeat; tries++) {
            let query = {};
            for (let param of ExternalApi.memeWords.queryParams) {
                query[param.name] = utils.getRandomInt(param.value, param.value * 10);
            }

            // If we define "page" value bigger than 1000 (that value maybe going to change or increase in future) every request would give us random word
            let html = await rpn.get({
                url: ExternalApi.memeWords.url,
                qs: query
            });

            let resultMatch = memeWordRegExp.exec(html);
            console.log(resultMatch);
            if (resultMatch) {
                tries = appValues.memeWords.maxApiRepeat;
                res.json({
                    name: utils.escapeHtml(striptags(resultMatch[1])),
                    def: utils.escapeHtml(striptags(resultMatch[2]))
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

function _getWordDefinition (def) {
    return def && def.replace(/^.+?\s+?/, "");
}

module.exports = {
    getDailyWord,
    getRandomWord,
    getMemeWord
};