"use strict";

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function timer (start) {
    if (!start) {
        return process.hrtime();
    }
    let end = process.hrtime(start);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
}

function cleanWordDefinition (def) {
    return def && def.replace(/^.+?\s+?/, "");
}

function escapeHtml (text) {
    const map = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": `"`, // eslint-disable-line
        "&#039;": "'",
        "&apos;": "`"
    };

    return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#039;|&apos;)/g, m => map[m]);
}

module.exports = {
    getRandomInt,
    timer,
    cleanWordDefinition,
    escapeHtml
};
