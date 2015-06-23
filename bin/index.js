#!/usr/bin/env node
"use strict";

var program = require("commander"),
    
    merge   = require("../src/merge");

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
    .option("-o, --output <path>", "Save imported config to <path>")
    .option("-m, --multiple", "Save each zone as its own file")
    .action(function(zones, env) {
        env = merge(env.parent, env, {
            zones : zones
        });

        require("../src/commands/import")(env);
    });

program
    .command("check <config>")
    .description("Validate <config>")
    .action(function(config, env) {
        env = merge(env.parent, env, {
            config : config
        });

        require("../src/commands/check")(env, function(err, result) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
            
            if(env.verbose) {
                console.log(require("util").inspect(result, { depth : null }));
            }
        });
    });

program
    .command("diff <config> [<zones>...]")
    .description("Diff Route53 against <config>")
    .action(function(config, zones, env) {
        env = merge(env.parent, env, {
            config : config,
            zones  : zones
        });

        require("../src/commands/diff")(env, function(err) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

program
    .command("commit <config> [zones...]")
    .description("Commit <config> to Route53")
    .action(function(config, zones, env) {
        env = merge(env.parent, env, {
            config : config,
            zones  : zones
        });

        require("../src/commands/commit")(env, function(err) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

program
    .command("clean <config> [<zones>...]")
    .description("List stale records in Route53")
    .action(function(config, zones, env) {
        env = merge(env.parent, env, {
            config : config,
            zones  : zones
        });

        require("../src/commands/clean")(env, function(err) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
        });
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
