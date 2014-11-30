"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    async = require("async"),

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
        require("../transformers/aws-to-config"),
        require("../validators/config/")
        
    ], function(err, data) {
        if(err) {
            throw new Error(err);
        }
        
        if(env.output) {
            fs.writeFileSync(
                path.resolve(process.cwd(), env.output),
                JSON.stringify(data.config, null, 4),
                "utf8"
            );
        } else {
            console.log(JSON.stringify(data.config, null, 4));
        }
    });
};
