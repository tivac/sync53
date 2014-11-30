"use strict";

var path = require("path"),
    fs   = require("fs"),
    
    strip = require("strip-json-comments");

module.exports = function readConfig(data, done) {
    var file = path.resolve(process.cwd(), data.env.file);

    if(!fs.existsSync(file)) {
        return done(new Error("Invalid config file path: " + file));
    }

    file = fs.readFileSync(file, "utf8");
    
    try {
        data.config = JSON.parse(strip(file));
    } catch(e) {
        done(e);
    }
    
    done(null, data);
};
