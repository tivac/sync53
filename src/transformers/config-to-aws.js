"use strict";

var moment = require("moment"),
    obj    = require("object-path");

function each(obj, fn) {
    var key;

    for(key in obj) {
        fn(obj[key], key);
    }
}

module.exports = function(data, done) {
    var changes = [];

    each(data.zones, function(zone, dns) {
        var ttl = zone.ttl || "5 minutes";

        // Turn TTL like "5 minutes"/"2 days"/"3 years" into seconds for AWS
        ttl = ttl.split(/(\d+) (\w+)/);
        ttl = moment.duration(parseInt(ttl[1], 10), ttl[2]).asSeconds();

        console.log(ttl); //TODO: REMOVE DEBUGGING
    });

    done(null, changes);
};
