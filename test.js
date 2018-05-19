// Test stuff

const cuts = require("./cuts.js");
const fs = require("./fsasync.js");
const assert = require("assert").strict;
const { spawn } = require("child_process");

function eventToHappen(eventFn) {
    return new Promise((resolve, reject) => {
        eventFn(resolve);
    });
}

function makeDateLess(monthMinus) {
    let d = new Date();
    let newMonth = d.getMonth() - monthMinus;
    d.setMonth(newMonth);
    return d;
}

// Run cuts repeatedly with different dates and assert we only get one at the end
async function test () {
    let app = {
        commands: {
            "disc_free": "df -h",
            "uptime": "uptime"
        }
    };

    let dir = "testlogdir";

    // Clear up the test dir
    let child = spawn("/bin/rm", ["-rf", dir]);
    child.stderr.pipe(process.stderr);
    child.stdout.pipe(process.stdout);
    let scriptEnd = proc => child.on("exit", proc);
    await eventToHappen(scriptEnd);

    // do commony
    await cuts.commonyQueue(dir, makeDateLess(4), app);
    await cuts.commonyQueue(dir, makeDateLess(3), app);
    await cuts.commonyQueue(dir, makeDateLess(2), app);
    await cuts.commonyQueue(dir, makeDateLess(1), app);

    let listing = await fs.promises.readdir(dir)
        .catch(e => e.code=="ENOENT" ? null : e);

    assert.deepStrictEqual(listing, ["2018-04"]);
}

test();

// Tests end here
