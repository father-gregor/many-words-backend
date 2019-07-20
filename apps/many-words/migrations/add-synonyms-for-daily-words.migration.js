const Models = require("../models");
const WordFetcher = require("../src/services/word-fetcher.service");
const Logger = require("../../../common/services/logger.service");

const DailyWord = Models.DailyWord;

async function execMigration () {
    const wordsWithoutSynonyms = await DailyWord.find({synonyms: {$exists: false}}).exec();
    if (wordsWithoutSynonyms) {
        for (let word of wordsWithoutSynonyms) {
            try {
                const synonyms = await WordFetcher.requestWordSynonyms(word.name);
                if (synonyms) {
                    word.synonyms = synonyms;
                    await word.save();
                }
            } catch (err) {
                Logger.error(err.message, err);
                console.log(`Failed to add synonyms for word "${word.name}"`); // eslint-disable-line
            }
        }
    }
}

module.exports = {
    execMigration,
    name: "Add synonyms for daily words"
};
