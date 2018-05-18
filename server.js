const cuts = require("./cuts.js");

const express = require("express");
const indexer = require("serve-index");
const http = require("http");

const app = express();

const things = {
    "du_of_home_dir": "du -h /home/nicferrier",
    "disc_free": "df -h",
    "uptime": "uptime"
}

const logDir = __dirname + "/logdir";

async function cut() {
    await cuts.commonyQueue(logDir, new Date(), things);
}

let minutes15 = 1000 * 60 * 15;
setInterval(cut, minutes15);

exports.boot = function (port, options) {
    let opts = options != undefined ? options : {};
    let rootDir = opts.rootDir != undefined ? opts.rootDir : logDir;
    let rootPath = opts.rootPath != undefined ? opts.rootPath : "/cuts";
    let jsFile = opts.jsFile != undefined ? opts.jsFile : "/index.js";

    app.use(rootPath,
            express.static(rootDir),
            indexer(rootDir, {'icons': true}));

    let listener = app.listen(port, "localhost", async function () {
        console.log("listening on ", listener.address().port);
    });
};

exports.boot(8001);

// End
