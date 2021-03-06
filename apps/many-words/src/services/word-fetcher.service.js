"use strict";

const rpn = require("request-promise-native");
const urbanDictionary = require("urban-dictionary");

const appValues = require("../../config/app.values.json");
const Utils = require("../services/utils.service");
const ExternalApi = require("../../config/external-api.values.json");

async function requestRandomWord () {
    let wildcard = "";
    let min = appValues.randomWords.wildcard.min;
    let max = appValues.randomWords.wildcard.max;
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let wildcardLength = Utils.getRandomInt(min, max);

    // TODO Optimize process to append two-three symbols prefix for more randomized result
    wildcard = alphabet.charAt(Utils.getRandomInt(0, alphabet.length - 1));
    for (let i = 0; i < wildcardLength; i++) {
        wildcard += "?";
    }

    let randomWords = await rpn.get({
        url: ExternalApi.randomWords.url,
        qs: {
            sp: wildcard,
            md: "d"
        },
        json: true
    });

    return randomWords[Utils.getRandomInt(0, randomWords.length)];
}

async function requestMemeWord () {
    const memeResult = await urbanDictionary.random();
    return {
        word: memeResult.word.replace(/\[|\]/gm, ""),
        definition: memeResult.definition.replace(/\[|\]/gm, "")
    };
}

/** TODO Legacy method for retrieving meme words
async function requestMemeWord () {
    let query = {};
    let paramName = ExternalApi.memeWords.queryParams.name;
    let paramValue = ExternalApi.memeWords.queryParams.value;
    query[paramName] = Utils.getRandomInt(paramValue, paramValue * 10);

    // If we define "page" value bigger than 1000 (that value maybe going to change or increase in future) every request would give us random word
    return rpn.get({
        url: ExternalApi.memeWords.url,
        qs: query
    });
}
*/

async function requestWordSynonyms (word) {
    const synonyms = await rpn.get({
        url: ExternalApi.synonymsWords.url,
        qs: {
            rel_syn: word
        },
        json: true
    });

    return synonyms ? synonyms.map(s => s.word) : [];
}

module.exports = {
    requestRandomWord,
    requestMemeWord,
    requestWordSynonyms
};
