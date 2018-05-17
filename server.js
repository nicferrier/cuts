const { spawn } = require("child_process");
const fs = require('./fsasync.js');

const things = {
    "du_of_home_dir": "du -h /home/nicferrier",
    "disc_free": "df -h",
    "uptime": "uptime"
}

function eventToHappen(eventFn) {
    return new Promise((resolve, reject) => {
        eventFn(resolve);
    });
}

function commonyQueue(logDir) {
    let runDate = new Date();
    let runDateStr = runDate.getFullYear()
        + runDate.getMonth() + 1
        + runDate.getDate()
        + runDate.getHours()
        + runDate.getMinutes();
    
    Object.keys(things).forEach(async dirName => {
        let out = fs.createWriteStream(logDir + "/" + dirName + "-" + runDateStr);
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

commonyQueue();

// End
