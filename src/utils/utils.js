"use strict";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function timer (start) {
    if (!start)
        return process.hrtime();
    let end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}

/**
 * Convert string to UTC date. String date can be only in format of "dd.mm.YYYY"
 * @param {*} stringDate 
 */
function createUTCDate (stringDate) {
    let result = stringDate.split(".");
    let Year = parseInt(result[2]);
    let Month = parseInt(result[1]) - 1;
    let DayOfMonth = parseInt(result[0]);
    return new Date(Date.UTC(Year, Month, DayOfMonth));
}

function escapeHtml (text) {
    const map = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": `"`,
      "&#039;": "'",
      "&apos;": "`"
    };

    return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#039;|&apos;)/g, (m) => map[m]);
  }

module.exports = {
    getRandomInt,
    timer,
    createUTCDate,
    escapeHtml
}