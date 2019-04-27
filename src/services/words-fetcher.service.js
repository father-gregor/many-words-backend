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

module.exports = {
    requestRandomWord
};
