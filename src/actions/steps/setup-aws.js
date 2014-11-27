"use strict";

var aws = require("aws-sdk");

module.exports = function setupAWS(data, done) {
    var http = {};

    if(data.env.proxy) {
        http.proxy = data.env.proxy;
    }

    data.r53 = new aws.Route53({
        accessKeyId     : data.env.key,
        secretAccessKey : data.env.secret,
        sslEnabled      : true,
        logger          : data.env.verbose ? console : null,
        httpOptions     : http
    });

    done(null, data);
};
