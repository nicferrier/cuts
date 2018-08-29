const cuts = require("./cuts.js");

const express = require("express");
const indexer = require("serve-index");
const http = require("http");

const app = express();

const things = {
    "du_of_home_dir": "du -h ~/",
    "disc_free": "df -h",
    "uptime": "uptime"
}

exports.boot = function (port, options) {
    let opts = options != undefined ? options : {};

    let defLogDir = __dirname + "/logdir";
    let logDir = opts.logDir != undefined ? opts.logDir : defLogDir;
    let rootDir = opts.rootDir != undefined ? opts.rootDir : logDir;
    let rootPath = opts.rootPath != undefined ? opts.rootPath : "/cuts";
    let iface = opts.interface != undefined ? opts.interface : "localhost";

    app.use(rootPath,
            express.static(rootDir),
            indexer(rootDir, {'icons': true}));

    // Standard app callback stuff
    let appCallback = opts.appCallback;
    if (typeof(appCallback) === "function") {
        appCallback(app);
    }

    let listener = app.listen(port, iface, async function () {
        let listenerCallback = opts.listenerCallback;
        if (typeof(listenerCallback) === "function") {
            listenerCallback(listener.address());
        }

        let minutes15 = 1000 * 60 * 15;
        let runInterval = opts.runInterval != undefined ? opts.runInterval : minutes15;
        let commands = opts.commands != undefined ? opts.commands : things;
        app.commands = commands;
        
        let cutFn = async function () {
            await cuts.commonyQueue(logDir, new Date(), app);
        };

        setInterval(cutFn, runInterval);

        console.log("listening on ", listener.address().port);
    });
};

if (require.main === module) {
    exports.boot(process.env.PORT || 8001); 
}
else {
    // Required as a module; that's ok, exports will be fine.
}


// End
