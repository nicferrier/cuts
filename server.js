const { spawn } = require("child_process");
const path = require('path');
const fs = require('fs');
fs.promises = require('./fsasync.js').promises;

const things = {
    "du_of_home_dir": "du -h /home/nicferrier",
    "disc_free": "df -h",
    "uptime": "uptime"
}

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
};

function eventToHappen(eventFn) {
    return new Promise((resolve, reject) => {
        eventFn(resolve);
    });
}

async function commonyQueue(logDir) {
    let runDate = new Date();
    let runDateStr = path.join(
        logDir,
        runDate.getFullYear()
            + "-" + ("0" + (runDate.getMonth() + 1)).substr(-2),
        "" + runDate.getDate(),
        ("0" + runDate.getHours()).substr(-2)
            + ("0" + runDate.getMinutes()).substr(-2),
        "placeholder"
    );

    let directory = path.dirname(runDateStr);
    let dirParts = directory.split(path.sep);
    async function mkdirRecur (mkdir, rest) {
        await fs.promises.mkdir(mkdir).catch(e => console.log("error!", e));
        if (rest.length > 0) {
            let next = path.join(mkdir, rest[0]);
            let nextRest = rest.slice(1);
            await mkdirRecur(next, nextRest);
        }
    };

    await mkdirRecur(dirParts[0], dirParts.slice(1));
    Object.keys(things).forEach(async dirName => {
        let fileName = path.join(path.dirname(runDateStr), dirName + ".txt");
        let out = fs.createWriteStream(fileName);
        let script = things[dirName];
        child = spawn("/bin/bash", ["-c", script]);
        child.stderr.pipe(out);
        child.stdout.pipe(out);
        let scriptEnd = proc => child.on("exit", proc);
        await eventToHappen(scriptEnd);
        out.end();
    });
}

let minutes15 = 1000 * 60 * 15;
//setInterval(commonyQueue, minutes15);

commonyQueue("logdir");

// End
