"use strict";

const rpn = require("request-promise-native");
const cheerio = require("cheerio");
const utils = require("../utils/utils");

const defaultCount = 30;
const rawAPIUrl = "http://listofrandomwords.com";
const mainAPIUrl = "https://api.datamuse.com/words";

async function collect ({wordsCount}) {
    let count = wordsCount || defaultCount;
    let rawWords = await _getRawWordsList();
    if (!rawWords) {
        throw new Error();
    }

    return await _getExtractedWordsList(rawWords, count);
}

async function _getRawWordsList () {
    try {
        let rawHtml = await rpn.post({
            url: `${rawAPIUrl}/index.cfm`,
            qs: {
                blist: ""
            },
            form: {
                oType: "blist",
                lst_howmany: 50,
                lst_wLenOper: "Equals",
                par_numPara: 3,
                par_numSent: 5,
                par_numWordsSent: 14,
                tbl_numCols: 3,
                tbl_numRows: 3,
                tbl_tblHead: 0
            },
            headers: {
                "Accept-Encoding": "gzip, deflate",
                "User-Agent": _getRawAPIUserAgent(),
                "Host": rawAPIUrl.replace("http://", ""),
                "Origin": rawAPIUrl,
                "Referer": `${rawAPIUrl}/index.cfm?blist`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Upgrade-Insecure-Requests": 1
            }
        });
        console.log("Raw HTML", rawHtml);

        if (!rawHtml) {
            return;
        }

        let rawWords = [];
        let $ = cheerio.load(rawHtml);
        $("#results").find("li").each(function () {
            let word = $(this).text().trim();
            if (word.length > 3) {
                rawWords.push(word);
            }
        });

        if (rawWords.length <= 0) {
            return;
        }

        return rawWords;

    } catch (err) {
        console.error("Error: Failed to get raw words html\n", err);
        return;
    }
}

function _getRawAPIUserAgent () {
    return "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36";
}

async function _getExtractedWordsList (rawWords, maxCount) {
    let extractedWords = [];
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
            // TODO Add check for prefered part of speech
            if (suitableWords[i].defs && suitableWords[i].defs.length > 0 && suitableWords[i].length > 3) {
                extractedWords.push({
                    name: suitableWords[i].word,
                    definitions: suitableWords[i].defs.map((def) => utils.cleanWordDefinition(def)),
                    partOfSpeech: suitableWords[i].tags
                });
            }

            if (suitableWords.length >= maxCount) {
                i = suitableWords.length;
            }
        }

        if (suitableWords.length < maxCount) {
            await _wait(5000);
        }
    }

    return extractedWords;
}

function _wait (ms) {
    return new Promise(resolve=>{
        setTimeout(resolve, ms)
    });
}

module.exports = {
    collect
}