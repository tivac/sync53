#!/usr/bin/env node
"use strict";

// TODO: support creds from ENV as AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

var fs   = require("fs"),
    path = require("path"),
    args;

/*
Sync53, a more sane way to manage Route53

Usage:
    sync53 import [options]
    sync53 import [options] [<zones> ...]
    sync53 export <file>
    sync53 export [options] <file>
    sync53 export [options] <file> [<zones>...]
    sync53 -h | --help | --version
    sync53 --version

Options:
    # General Options
    -h, --help     Show this screen.
    --version      Show version.
    -v, --verbose  Verbose output
    --silent       Only errors will be output
    
    # AWS Details
    -k <key>, --key <key>           AWS Access Key
    -s <secret>, --secret <secret>  AWS Secret Access Key

    # Import Options
    -o <file>, --output <file>      Save imported config to a file

Arguments:
    
*/


// Welp, this call looks screwy. fdocopt returns a function from its module.exports
// which is itself a function that you have to invoke. *sigh* I just don't know...
args = require("fdocopt")()(__filename, { version : require("../package.json").version });

if(args.import) {
    require("./actions/import")(args);
} else {
    require("./actions/export")(args);
}
