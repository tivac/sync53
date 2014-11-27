"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    aws   = require("aws-sdk"),
    async = require("async"),
    strip = require("strip-json-comments"),

    fqdn           = require("../fqdn"),
    validateAWS    = require("../validators/aws/"),
    validateConfig = require("../validators/config/"),
    transform      = require("../transformers/config-to-aws");

module.exports = function(env) {
    var file = path.resolve(process.cwd(), env.file),
        config;

    console.log("EXPORT", env); //TODO: REMOVE DEBUGGING
    console.log(file); //TODO: REMOVE DEBUGGING

    if(!fs.existsSync(file)) {
        throw new Error("Invalid config file path: " + file);
    }

    config = fs.readFileSync(file, "utf8");
    config = JSON.parse(strip(config));

    async.waterfall([
        function start(done) {
            done(null, config);
        },
        transform,
    ], function(err, result) {
        if(err) {
            throw new Error(err);
        }

        console.log(result); //TODO: REMOVE DEBUGGING
    });
};
