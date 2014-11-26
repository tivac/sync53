#!/usr/bin/env node
"use strict";

var program = require("commander"),
    access  = {
        key    : process.env.AWS_ACCESS_KEY_ID,
        secret : process.env.AWS_SECRET_ACCESS_KEY
    };

function options(src) {
    var opts = {};

    src.options.forEach(function(option) {
        var name = option.long.replace(/^--/, "");

        if(name in src) {
            opts[name] = src[name];
        }
    });

    return opts;
}

function merge() {
    var result = {},
        size   = arguments.length,
        i, key, obj;

    for(i = 0; i < size; i++) {
        obj = arguments[i];

        for(key in obj) {
            result[key] = obj[key];
        }
    }

    return result;
}

program
    .version(require("../package.json").version)
    .option("-v, --verbose", "Verbose output")
    .option("--silent", "Silent output (only errors)")
    .option("--proxy <proxy>", "URL to proxy requests through")
    .option("-k, --key <key>", "AWS Access Key")
    .option("-s, --secret <secret>", "AWS Secret");

program
    .command("import [zones...]")
    .description("Import DNS information from Route53")
    .option("-o, --output <file>", "Save imported config to a file")
    .action(function(zones, env) {
        require("./actions/import")(merge(access, options(env.parent), options(env), {
            zones : zones
        }));
    });

program
    .command("export <file> [zones...]")
    .description("Write the config stored in file to Route53")
    .action(function(file, zones, env) {
        require("./actions/export")(merge(access, options(env.parent), options(env), {
            file  : file,
            zones : zones
        }));
    });

program.parse(process.argv);
