"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    strip = require("strip-json-comments");

module.exports = function(env, done) {
    var file = path.resolve(process.cwd(), env.file),
        config;

    if(!fs.existsSync(file)) {
        done(new Error("Invalid config file path: " + file));
    }

    config = fs.readFileSync(file, "utf8");
    
    try {
        config = JSON.parse(strip(config));
    } catch(e) {
        done(e);
    }
    
    require("../validators/config")({
        env    : env,
        config : config
    }, function(err, result) {
        if(err) {
            return done(new Error(err));
        }
        
        done(null, result.config);
    });
};
