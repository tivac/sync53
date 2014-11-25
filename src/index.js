#!/usr/bin/env node
"use strict";

// TODO: support creds from ENV as AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

var fs   = require("fs"),
    path = require("path"),
    args = require("docopt").docopt(
        // Use path.resolve here because otherwise it reads from the root which
        // feels wrong. Especially given that require works differently.
        fs.readFileSync(path.resolve(__dirname, "../cli.txt"), "utf8"),
        { version : require("../package.json").version }
    );

if(args.import) {
    require("./actions/import")(args);
} else {
    require("./actions/export")(args);
}
