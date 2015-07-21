"use strict";

var assert = require("assert"),
    fqdn   = require("../src/fqdn.js");
    
describe("lib", function() {
    describe("FQDN", function() {
        describe(".add()", function() {
            it("should add a trailing period", function() {
                assert.equal(fqdn.add("tivac.com"), "tivac.com.");
            });
            
            it("should not over-add trailing periods", function() {
                assert.equal(fqdn.add("tivac.com."), "tivac.com.");
            });
        });
        
        describe(".remove()", function() {
            it("should remove a trailing period", function() {
                assert.equal(fqdn.remove("tivac.com."), "tivac.com");
            });
            
            it("should not over-remove trailing periods", function() {
                assert.equal(fqdn.remove("tivac.com"), "tivac.com");
            });
        });
    });
});
