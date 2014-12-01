#!/usr/bin/env node
"use strict";

var program = require("commander"),
    access  = {
        key    : process.env.AWS_ACCESS_KEY_ID,
        secret : process.env.AWS_SECRET_ACCESS_KEY
    };

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

function creds(env) {
    if(!env.secret || !env.key) {
        throw new Error("No AWS Key/Secret defined");
    }
}

program
    .version(require("../package.json").version)
    .option("-v, --verbose", "Verbose output")
    .option("--silent", "Silent output (only errors)")
    .option("--proxy <proxy>", "URL to proxy requests through")
    .option("-k, --key <key>", "AWS Access Key")
    .option("-s, --secret <secret>", "AWS Secret");

program
    .command("import [<zones>...]")
    .description("Import DNS information from Route53")
    .option("-o, --output <file>", "Save imported config to <file>")
    .action(function(zones, env) {
        env = merge(access, env.parent, env, {
            zones : zones
        });

        creds(env);

        require("../src/commands/import")(env);
    });

program
    .command("check <file>")
    .description("Validate the config in <file>")
    .action(function(file, env) {
        env = merge(access, env.parent, env, {
            file  : file
        });

        require("../src/commands/check")(env, function(err, result) {
            if(err) {
                console.error(err.stack);
                process.exit(1);
            }
            
            if(env.verbose) {
                console.log(require("util").inspect(result, { depth : null }));
            }
        });
    });

program
    .command("diff <file> [<zones>...]")
    .description("Diff local config stored in <file> to current Route53 config")
    .action(function(file, zones, env) {
        env = merge(access, env.parent, env, {
            file  : file,
            zones : zones
        });

        creds(env);

        require("../src/commands/diff")(env);
    });

program
    .command("commit <file> [zones...]")
    .description("Commit local config stored in <file> to Route53")
    .action(function(file, zones, env) {
        env = merge(access, env.parent, env, {
            file  : file,
            zones : zones
        });

        creds(env);

        require("../src/commands/commit")(env);
    });

program
    .command("clean <file> [<zones>...]")
    .description("Display a list of stale records in Route53")
    .action(function(file, zones, env) {
        env = merge(access, env.parent, env, {
            file  : file,
            zones : zones
        });

        creds(env);

        require("../src/commands/clean")(env);
    });

// Show help if unknown command entered
program
    .on("*", function() {
        program.help();
    });

program.parse(process.argv);

// Show help when nothing is entered
if(!program.args.length) {
    program.help();
}