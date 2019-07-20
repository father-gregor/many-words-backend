"use strict";

const rpn = require("request-promise-native");

const appValues = require("../../config/app.values.json");
const Utils = require("../services/utils.service");
const ExternalApi = require("../../config/external-api.values.json");

async function requestRandomWord () {
    let wildcard = "";
    let min = appValues.randomWords.wildcard.min;
    let max = appValues.randomWords.wildcard.max;
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

    return randomWords[Utils.getRandomInt(0, randomWords.length)];
}

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

async function requestWordSynonyms (word) {
    const synonyms = await rpn.get({
        url: ExternalApi.synonymsWords.url,
        qs: {
            rel_syn: word,
            md: "d"
        },
        json: true
    });
    console.log(synonyms);

    return synonyms ? synonyms.map(s => s.word) : [];
}

module.exports = {
    requestRandomWord,
    requestMemeWord,
    requestWordSynonyms
};
