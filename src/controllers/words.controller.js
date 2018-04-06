import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from "constants";

"use strict";

const rpn = require("request-promise-native");
const appValues = require("../../config/app.values.json");
const utils = require("../utils/utils");
const ExternalApi = require("../../config/external-api.values.json");

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

async function getMemeWord () {
    try {
        //First group - word, second group - definition
        let memeWordRegExp = /<a class="word".+?>(.+?)<\/a>.+<div class="meaning".*?>(.+?)<\/div>/mi;

        let query = {};
        for (let param of ExternalApi.memeWords.queryParams) {
            query[param.name] = param.value;
        }

        // If we define "page" value bigger than 1000 (that value maybe going to change or increase in future) every request would give us random word
        let html = await rpn.get({
            url: ExternalApi.memeWords.url,
            qs: query
        });
        console.log(html);
        console.log(typeof html);
        let resultMatch = memeWordRegExp.exec(html);
        res.json({
            name: resultMatch[0],
            def: resultMatch[1]
        })
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

function _getWordDefinition (def) {
    return def && def.replace(/^.+?\s+?/, "");
}

module.exports = {
    getRandomWord,
    getMemeWord
};