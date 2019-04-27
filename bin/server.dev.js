"use strict";

const debug = require("debug")("many-words-backend");
const http = require("http");

const app = require("../index");

const port = process.env.PORT || "3000";
app.set("port", port);

let server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function onError (error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    let bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`); // eslint-disable-line
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`); // eslint-disable-line
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening () {
    let addr = server.address();
    let bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`\n\nExpress server listening on ${bind}`);
    console.log(`\n\nExpress server started and listening on ${bind}`); // eslint-disable-line
}
