"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    async = require("async"),
    shell = require("shelljs"),

    fqdn  = require("../fqdn");

module.exports = function(env) {
    // Ensure that we compare against FQDN versions we get from R53
    env.zones = env.zones.map(fqdn.add);

    async.waterfall([
        function setup(done) {
            var data = {
                    env : env
                };
            
            done(null, data);
        },
        
        require("./steps/setup-aws"),
        require("./steps/get-zones"),
        require("./steps/get-records"),
        function(data, done) {
            data.config = require("../transformers/aws-to-config")(data.aws);
            
            done(null, data);
        },
        
        require("./steps/validate-config")
        
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
