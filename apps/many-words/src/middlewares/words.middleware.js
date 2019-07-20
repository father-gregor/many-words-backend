function validateQueryParams (req, res, next) {
    if (!req.query.count) {
        return res.status(400).send();
    }

    const count = parseInt(req.query.count, 10);
    if (count > 10) {
        req.query.count = 10;
    }

    return next();
}

function validateSearchParams (req, res, next) {
    if (!req.query.searchTerm || req.query.searchTerm.length < 3) {
        return res.status(400).send();
    }

    req.query.maxWords = req.query.maxWords && req.query.maxWords <= 100 ? req.query.maxWords : 10;

    return next();
}

function validateMemeWordsParams (req, res, next) {
    if (req.query.os && req.query.os.toLowerCase().includes("ios")) {
        req.query.checkProfanities = true;
    }

    return next();
}

module.exports = {
    validateQueryParams,
    validateSearchParams,
    validateMemeWordsParams
};
