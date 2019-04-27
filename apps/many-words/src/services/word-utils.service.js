"use strict";

const natural = require("natural");
const profanitiesValues = require("../../config/profanities.json");

const ProfanitiesTrie = new natural.Trie();
ProfanitiesTrie.addStrings(profanitiesValues);

function checkForProfanities (sentence) {
    const words = sentence ? sentence.split(" ") : "";
    for (let word of words) {
        const res = ProfanitiesTrie.contains(word);
        if (res) {
            return true;
        }
    }
    return false;
}

module.exports = {
    checkForProfanities
};
