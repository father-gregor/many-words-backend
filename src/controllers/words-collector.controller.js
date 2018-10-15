"use strict";

const rpn = require("request-promise-native");
const cheerio = require("cheerio");
const utils = require("../utils/utils");
const AvailablePartOfSpeech = require("../../config/app.values.json").dailyWords.partOfSpeech;

const defaultCount = 30;
const rawAPIUrl = "http://listofrandomwords.com";
const mainAPIUrl = "https://api.datamuse.com/words";

async function collect ({wordsCount}) {
    let maxCount = wordsCount || defaultCount;
    let extractedWords = [];
    let start = utils.timer();
    while (extractedWords.length < maxCount) {
        let rawWords = await _getRawWordsList();
        if (!rawWords) {
            throw new Error();
        }
        for (let rawWord of rawWords) {
            let suitableWords = await rpn.get({
                url: mainAPIUrl,
                qs: {
                    sp: rawWord,
                    md: "dp"
                },
                json: true
            });
    
            if (!suitableWords) {
                return;
            }
    
            for (let i = 0; i < suitableWords.length; i++) {
                let partOfSpeech = suitableWords[i].tags && suitableWords[i].tags.find((tag) => AvailablePartOfSpeech.includes(tag));
                if (suitableWords[i].defs && suitableWords[i].defs.length > 0 && partOfSpeech) {
                    extractedWords.push({
                        name: suitableWords[i].word,
                        definitions: suitableWords[i].defs.map((def) => utils.cleanWordDefinition(def)),
                        partOfSpeech: partOfSpeech,
                        language: "en"
                    });
                    i = suitableWords.length;
                }
    
                if (suitableWords.length >= maxCount) {
                    i = suitableWords.length;
                }
            }
    
            await _wait((Math.random() * 100 + 1));
        }

        if (utils.timer(start) > 3000 * maxCount) {
            throw new Error("Error: Exceed max allowed time for words collecting. Abort operation");
        }
    }

    return extractedWords;
}

async function _getRawWordsList () {
    try {
        let rawWords = [];
        let $ = await rpn.post({
            url: `${rawAPIUrl}/index.cfm`,
            qs: {
                blist: ""
            },
            form: {
                "oType": "blist",
                "lst_howmany": "10",
                "lst_fLetter": "", 
                "wSizeType": "",
                "lst_wLen": "", 
                "lst_wLenOper": "Equals",
                "par_numPara": "3",
                "par_numSent": "5",
                "par_numWordsSent": "14",
                "tbl_numCols": "3",
                "tbl_numRows": "3",
                "tbl_tblHead": "0"
            },
            transform: function (body) {
                return body ? cheerio.load(body) : undefined;
            }
        });

        console.log("FINISHED REQUEST");

        if (!$) {
            throw null;
        }

        $("#results").find("li").each(function () {
            let word = $(this).text().trim();
            if (word.length > 3) {
                rawWords.push(word);
            }
        });

        console.log(rawWords);

        if (rawWords.length <= 0) {
           throw null;
        }

        return rawWords;

    } catch (err) {
        throw new Error("Error: Failed to get raw words html\n");
    }
}

function _wait (ms) {
    return new Promise(resolve=>{
        setTimeout(resolve, ms)
    });
}

module.exports = {
    collect
}