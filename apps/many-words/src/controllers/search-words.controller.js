"use strict";

const rpn = require("request-promise-native");

const Utils = require("../services/utils.service");
const ExternalApi = require("../../config/external-api.values.json");

async function searchWords (req, res) {
    let words = await rpn.get({
        url: ExternalApi.searchWords.url,
        qs: {
            sp: `${req.query.searchTerm}*`,
            md: "d"
        },
        json: true
    });

    let result = [];
    let maxWords = req.query.maxWords;
    let i = 0;
    while (i < words.length && result.length <= maxWords) {
        let searchWord = words[i];
        if (searchWord.defs && searchWord.defs.length > 0) {
            result.push({
                name: searchWord.word,
                definitions: searchWord.defs.map(Utils.cleanWordDefinition),
                publishDateUTC: new Date()
            });
        }

        i++;
    }

    return res.json(result);
}

module.exports = {
    searchWords
};