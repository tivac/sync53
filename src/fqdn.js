"use strict";

exports.remove = function(dns) {
    return dns.replace(/\.$/, "");
};

exports.add = function(dns) {
    return dns.replace(/([^.])$/, "$1.");
};
