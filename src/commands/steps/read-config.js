"use strict";

var path = require("path"),
    fs   = require("fs"),
    
    joi   = require("joi"),
    shell = require("shelljs"),
    strip = require("strip-json-comments"),
    
    schema = require("../../validators/config"),

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
    
    joi.validate(data.config, schema, function(err) {
        if(err) {
            return done(err.details.map(function(detail) {
                return "Invalid: " + detail.message + " (" + detail.path + ")";
            }).join(" "));
        }
        
        done(null, data);
    });
};
