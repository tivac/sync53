"use strict";

var ok = require("./_validate")(require("../src/validators/record"));

describe("validators", function() {
    describe("records", function() {
        it("should support object records", function() {
            ok.valid({
                A : "wooga"
            });
        });
            
        it("should support records being an array", function() {
            ok.valid({
                A : [
                    "wooga",
                    "booga"
                ]
            });
        });
        
        describe("alias records", function() {
            it("should be supported", function() {
                ok.valid({
                    A : {
                        alias : "fooga.com"
                    }
                });
            });
            
            it("should support health checks", function() {
                ok.valid({
                    A : {
                        alias : {
                            dns    : "thing.example.com",
                            health : true
                        }
                    }
                });
            });
            
            it("should support cloudfront", function() {
                ok.valid({
                    A : {
                        alias : "123456asdfasd.cloudfront.net"
                    }
                });
            });
            
            it("should not support a ttl", function() {
                ok.invalid({
                    ttl : "5 minutes",
                    A   : {
                        alias : "fooga.com"
                    }
                });
            });
            
            it("should require a dns value", function() {
                ok.invalid({
                    A : {
                        alias : {
                            health : true
                        }
                    }
                });
            });
        });
        
        describe("routing", function() {
            describe("latency-based", function() {
                it("should be supported", function() {
                    ok.valid({
                        type   : "A",
                        id     : "DFW",
                        region : "us-west-1",
                        alias  : "thing-a.example.com"
                    });
                });

                it("should require an id", function() {
                    ok.invalid({
                        type   : "A",
                        region : "us-west-1",
                        alias  : "thing-a.example.com"
                    });
                });
            });
            
            describe("gelocation routing", function() {
                it("should be support", function() {
                    ok.valid({
                        A  : "127.0.0.9",
                        id : "europe",
                        
                        location : {
                            continent : "EU"
                        }
                    });

                    ok.valid({
                        A  : "127.0.0.10",
                        id : "thailand",
                        
                        location : {
                            country : "TH"
                        }
                    });
                    
                    ok.valid({
                        A  : "127.0.0.8",
                        id : "washington",
                        
                        location : {
                            country : "US",
                            area    : "WA"
                        }
                    });
                });

                it("shouldn't allow country/area with continent", function() {
                    ok.invalid({
                        A  : "127.0.0.9",
                        id : "europe",
                        
                        location : {
                            continent : "EU",
                            country   : "FR"
                        }
                    });
                    
                    ok.invalid({
                        A  : "127.0.0.9",
                        id : "europe",
                        
                        location : {
                            continent : "NA",
                            area      : "WA"
                        }
                    });
                });

                it("should require an id", function() {
                    ok.invalid({
                        A : "127.0.0.9",
                        
                        location : {
                            continent : "EU"
                        }
                    });
                });
            });

            describe("weighted routing", function() {
                it("should be supported", function() {
                    ok.valid({
                        A      : "127.0.0.5",
                        id     : "weight1",
                        weight : 1
                    });
                });
                
                it("should require an id", function() {
                    ok.invalid({
                        A      : "127.0.0.5",
                        weight : 1
                    });
                });
            });
        });
    });
});
