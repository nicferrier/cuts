// Test stuff

const cuts = require("./cuts.js");
const fs = require("./fsasync.js");
const assert = require("assert").strict;

function makeDateLess(monthMinus) {
    let d = new Date();
    let newMonth = d.getMonth() - monthMinus;
    d.setMonth(newMonth);
    return d;
}

async function test () {
    // easy to test things
    let things = {
        "disc_free": "df -h",
        "uptime": "uptime"
    };

    let dir = "testlogdir";

    await cuts.commonyQueue(dir, makeDateLess(4), things);
    await cuts.commonyQueue(dir, makeDateLess(3), things);
    await cuts.commonyQueue(dir, makeDateLess(2), things);
    await cuts.commonyQueue(dir, makeDateLess(1), things);

    let listing = await fs.promises.readdir(dir)
        .catch(e => e.code=="ENOENT" ? null : e);

    assert.deepStrictEqual(listing, ["2018-04"]);
}

test();

// Tests end here
