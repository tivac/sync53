"use strict";

var path = require("path"),
    fs   = require("fs"),
    
    shell = require("shelljs"),
    strip = require("strip-json-comments"),

    extRegex = /\.json$/i;

function parse(src) {
    var contents = fs.readFileSync(src, "utf8");

    try {
        contents = JSON.parse(strip(contents));
    } catch(e) {
        e.message = "Unable to parse " + src + ", " + e.message;

        throw e;
    }
    
    return contents;
}

module.exports = function readConfig(data, done) {
    var src  = path.resolve(process.cwd(), data.env.config),
        file = shell.test("-f", src),
        dir  = shell.test("-d", src);

    if(!file && !dir) {
        return done(new Error("Invalid config path: " + src));
    }

    if(file) {
        data.config = parse(src);
    } else {
        data.config = {
            zones : {}
        };

        shell
            .find(src)
            .filter(shell.test.bind(shell, "-f"))
            .filter(extRegex.test.bind(extRegex))
            .forEach(function(config) {
                var json = parse(config);

                Object.keys(json.zones).forEach(function(dns) {
                    data.config.zones[dns] = json.zones[dns];
                });
            });
    }
    
    done(null, data);
};
