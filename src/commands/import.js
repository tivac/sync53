"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    async = require("async"),
    shell = require("shelljs"),
    joi   = require("joi"),

    fqdn  = require("../fqdn"),
    
    schema = require("../validators/config");

module.exports = function(env) {
    // Ensure that we compare against FQDN versions we get from R53
    env.zones = env.zones.map(fqdn.add);

    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/setup-aws"),
        require("./steps/get-zones"),
        require("./steps/get-records"),
        
        function transformConfig(data, done) {
            data.config = require("../transformers/aws-to-config")(data.aws);
            
            done(null, data);
        },
        
        function validateConfig(data, done) {
            joi.validate(data.config, schema, function(err) {
                if(err) {
                    return done(err);
                }
                
                done(null, data);
            });
        }
        
    ], function(err, data) {
        var dest;

        if(err) {
            throw new Error(err);
        }
        
        if(!env.output) {
            return console.log(JSON.stringify(data.config, null, 4));
        }

        dest = path.resolve(process.cwd(), env.output);
        
        if(!env.multiple) {
            return fs.writeFileSync(
                dest,
                JSON.stringify(data.config, null, 4),
                "utf8"
            );
        }
        
        // Multiple needs to write to a dir, so make sure it exists
        shell.mkdir(dest);

        Object.keys(data.config.zones).forEach(function(dns) {
            var config = {
                    zones : {}
                };

            config.zones[dns] = data.config.zones[dns];

            fs.writeFileSync(
                path.join(dest, dns + ".json"),
                JSON.stringify(config, null, 4),
                "utf8"
            );
        });
    });
};
