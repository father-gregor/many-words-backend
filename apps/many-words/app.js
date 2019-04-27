module.exports = function (app) {
    // API ROUTES
    require("./src/routing/words.routes")(app); // eslint-disable-line global-require
};
