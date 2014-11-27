"use strict";

var async = require("async");

module.exports = function getZones(data, done) {
    var completed = false,
        zones     = [],
        marker;

    async.until(
        function() {
            return completed;
        },
        function listHostedZones(cb) {
            data.r53.listHostedZones({
                MaxItems : "5",
                Marker   : marker
            }, function(err, data) {
                if(err) {
                    return cb(err);
                }

                zones = zones.concat(data.HostedZones);

                marker    = data.NextMarker;
                completed = !data.IsTruncated;

                cb();
            });
        },
        function(err) {
            if(err) {
                return done(err);
            }

            if(data.env.zones.length) {
                zones = zones.filter(function(zone) {
                    return data.env.zones.some(function(test) {
                        return test === zone.Name;
                    });
                });
            }

            data.zones = zones;

            done(null, data);
        }
    );
};
