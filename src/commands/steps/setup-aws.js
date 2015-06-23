"use strict";

var aws = require("aws-sdk");

module.exports = function setupAWS(data, done) {
    var http = {};

    if(data.env.proxy) {
        http.proxy = data.env.proxy;
    }

    data.r53 = new aws.Route53({
        sslEnabled      : true,
        
        accessKeyId     : data.env.key || null,
        secretAccessKey : data.env.secret || null,
        
        logger          : data.env.verbose ? console : null,
        
        httpOptions     : {
            proxy : data.env.proxy || null
        }
    });

    done(null, data);
};
