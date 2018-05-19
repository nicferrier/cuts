# Common Unix Task Server

Some things are just easier if you run standard unix tools. It might
be the easiest way to get visibility on disc usage, for example.

So this is a little server that runs unix commands frequently and lets
us know the result.


## Using as a server

```
 $ npm install -g cuts
 $ node cuts
```

the server will present an HTTP interface and start doing some default
commands every 15 minutes.


## Use as a module

```
 $ npm install cuts
```

You can write a module which will make the server available and
heavily customize it:

```

const cutsServer = require("cuts");

cutsServer.boot(8001, {
  appCallback: function (app) {
     app.get("/service-status", (req, res) => {
        res.json({
           up: true,
           lastQueryedDate: new Date()
         });
     });
  }
});
```

### Options to pass to boot

* runInterval - the time in seconds to run the commands
* appCallback - a function, called with the express app so you can configure routes
* listenerCallback - a function, called with the listener address so you can enquire of the listener
* logDir - a string indicating the path of the log directory where the output of the commands is collected; by default this is "logdir"
* commands - an object describing the keys to run

### commands

An example commands:

```

{ "du_of_home_dir": "du -h ~/",
  "disc_free": "df -h",
  "uptime": "uptime"
  }
```

The keys are descriptions but also must be capable of being directory
names.

The values are unix commands expressed as a string. These are passed
to bash directly as a script.


### Other customizations

When used as a program the PORT environment variable is examined for
the listener port.

If nothing is in PORT then 8001 is used as a default.


## What is cuts for?

We have a lot of monitoring tools for cloud environments but in a
situation where you have lots of cattle like servers sometimes the
quickest way to get a job done is to use a unix command.

cuts let's you specify those unix commands, run them frequently and
capture the output.

This gives you an extra layer of monitoring.
