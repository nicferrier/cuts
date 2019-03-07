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

const dirSplit = new RegExp("([0-9]{4})-([0-9]{2})-([0-9]{2})");

exports.commonyQueue = async function(logDir, runDate, app) {
    // console.log("cut", runDate, app.commands);
    let shell = app.shell == undefined ? "bash" : app.shell;

    let yearMonthDayStr = runDate.getFullYear()
        + "-" + ("0" + (runDate.getMonth() + 1)).substr(-2)
        + "-" + ("0" + (runDate.getDate())).substr(-2);

    let runDateStr = path.join(
        logDir,
        yearMonthDayStr,
        "" + runDate.getDate(),
        ("0" + runDate.getHours()).substr(-2)
        + ("0" + runDate.getMinutes()).substr(-2),
        "placeholder"
    );

    // console.log("runDateStr", runDateStr);

    let todayDate = parseInt(yearMonthDayStr);
    let listing = await fs.promises.readdir(logDir)
        .catch(e => e.code=="ENOENT" ? null : e);
    // console.log("listing", listing);
    if (listing instanceof Array) {
        await listing.forEachAsync(async entry => {
            let [_, yearStr, monthStr, dayStr] = dirSplit.exec(entry);
            let dirDate = parseInt(yearStr + monthStr + dayStr);
            let dateLine = todayDate - 3;
            // console.log("run date", runDate, "dirDate", dirDate, "date line", dateLine);
            if (dirDate <= dateLine) {
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
    // console.log("dirParts", dirParts, directory);

    async function mkdirRecur (mkdir, rest) {
        mkdir = mkdir == "" ? "/" : mkdir;
        // console.log("mkdir", mkdir, rest);
        await fs.promises.mkdir(mkdir)
            .catch(e => e.code=="EEXIST" ? null : e);
        if (rest.length > 0) {
            let next = path.join(mkdir, rest[0]);
            let nextRest = rest.slice(1);
            await mkdirRecur(next, nextRest);
        }
    };
    await mkdirRecur(dirParts[0], dirParts.slice(1));

    await Object.keys(app.commands).forEachAsync(async dirName => {
        let fileName = path.join(path.dirname(runDateStr), dirName + ".txt");
        let out = fs.createWriteStream(fileName);
        let script = app.commands[dirName];
        console.log("run ", runDate, "doing ", script);
        let child = spawn(shell, ["-c", script]);
        // child.stderr.pipe(out);
        child.stdout.pipe(out);
        child.on("error", err=>console.log);
        let scriptEnd = proc => child.on("close", proc);
        await eventToHappen(scriptEnd);
        out.end();
    });

    app.lastRunDir = directory;
};

// cuts ends here
