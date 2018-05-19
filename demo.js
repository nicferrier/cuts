const cutsServer = require("./server.js");

cutsServer.boot(8001, {
    commands: {
        df: "df -h",
        du_home: "du -h ~/",
        node_processes: "ps ajx | grep node"
    },
    runInterval: 1000 * 30,
    appCallback: function (app) {
        app.set('json spaces', 2);
        app.get("/service-status", (req, res) => {
            res.json({
                up: true,
                lastQueryedDate: new Date(),
                lastRunDir: app.lastRunDir,
                commands: app.commands
            });
        });
    }
});
