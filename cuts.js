const { spawn } = require("child_process");
const path = require('path');
const fs = require('fs');
fs.promises = require('./fsasync.js').promises;

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
};

function eventToHappen(eventFn) {
    return new Promise((resolve, reject) => {
        eventFn(resolve);
    });
}

const dirSplit = new RegExp("([0-9]{4})-([0-9]{2})");

exports.commonyQueue = async function(logDir, runDate, things) {
    console.log("cut", runDate, things);
    
    let yearMonthStr = runDate.getFullYear()
        + "-" + ("0" + (runDate.getMonth() + 1)).substr(-2);

    let runDateStr = path.join(
        logDir,
        yearMonthStr,
        "" + runDate.getDate(),
        ("0" + runDate.getHours()).substr(-2)
            + ("0" + runDate.getMinutes()).substr(-2),
        "placeholder"
    );

    console.log("runDateStr", runDateStr);

    let todayDate = parseInt(yearMonthStr);
    let listing = await fs.promises.readdir(logDir)
        .catch(e => e.code=="ENOENT" ? null : e);
    console.log("listing", listing);
    if (listing instanceof Array) {
        await listing.forEachAsync(async entry => {
            let [_, yearStr, monthStr] = dirSplit.exec(entry);
            let dirDate = parseInt(yearStr + monthStr);
            let dateLine = dirDate - 3;
            console.log("run date", runDate, "date line", dateLine);
            if (dirDate > dateLine - 3) {
                console.log(runDate, "old directory", entry, "to be removed");

                let fileName = path.join(logDir, entry);
                let child = spawn("/bin/rm", ["-rf", fileName]);
                child.stderr.pipe(process.stderr);
                child.stdout.pipe(process.stdout);
                let scriptEnd = proc => child.on("exit", proc);
                await eventToHappen(scriptEnd);
            }
        });
    }

    let directory = path.dirname(runDateStr);
    let dirParts = directory.split(path.sep);
    console.log("dirParts", dirParts, directory);

    async function mkdirRecur (mkdir, rest) {
        mkdir = mkdir == "" ? "/" : mkdir;
        console.log("mkdir", mkdir, rest);
        await fs.promises.mkdir(mkdir)
            .catch(e => e.code=="EEXIST" ? null : e);
        if (rest.length > 0) {
            let next = path.join(mkdir, rest[0]);
            let nextRest = rest.slice(1);
            await mkdirRecur(next, nextRest);
        }
    };
    await mkdirRecur(dirParts[0], dirParts.slice(1));

    await Object.keys(things).forEachAsync(async dirName => {
        let fileName = path.join(path.dirname(runDateStr), dirName + ".txt");
        let out = fs.createWriteStream(fileName);
        let script = things[dirName];
        console.log("run ", runDate, "doing ", script);
        let child = spawn("/bin/bash", ["-c", script]);
        child.stderr.pipe(out);
        child.stdout.pipe(out);
        let scriptEnd = proc => child.on("exit", proc);
        await eventToHappen(scriptEnd);
        out.end();
    });
};

// cuts ends here
