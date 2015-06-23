"use strict";

module.exports = function merge() {
    var result = {},
        size   = arguments.length,
        i, key, obj;

    for(i = 0; i < size; i++) {
        obj = arguments[i];

        for(key in obj) {
            result[key] = obj[key];
        }
    }

    return result;
};
