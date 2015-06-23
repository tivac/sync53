"use strict";

var assert    = require("assert"),
    transform = require("../src/transformers/aws-to-config.js");
    
describe("transformers", function() {
    describe("AWS to Config", function() {
        it("should create top-level zones", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : []
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {}
                    }
                }
            });
        });

        it("should create multiple top-level zones", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : []
                }, {
                    Name : "wooga.com.",
                    Records : []
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {}
                    },
                    "wooga.com" : {
                        records : {}
                    }
                }
            });
        });

        it("should convert simple records", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }]
                    }]
                }]);
            
            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                A : "127.0.0.1"
                            }
                        }
                    }
                }
            });
        });

        it("should convert simple records with multiple IPs", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }, {
                            Value : "127.0.0.2"
                        }]
                    }]
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                A : [
                                    "127.0.0.1",
                                    "127.0.0.2"
                                ]
                            }
                        }
                    }
                }
            });
        });

        it("should coalesce records sharing the same FQDN", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }]
                    }, {
                        Name : "fooga.com.",
                        Type : "A",
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }]
                    }, {
                        Name : "fooga.com.",
                        Type : "A",
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }]
                    }]
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : [{
                                A : "127.0.0.1"
                            }, {
                                A : "127.0.0.1"
                            }, {
                                A : "127.0.0.1"
                            }]
                        }
                    }
                }
            });
        });

        it("should convert TTL in seconds to human durations", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        TTL : 300,
                        ResourceRecords : [{
                            Value : "127.0.0.1"
                        }]
                    }]
                }]);
            
            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        ttl : "5 minutes",
                        records : {
                            "fooga.com" : {
                                A : "127.0.0.1",
                            }
                        }
                    }
                }
            });
        });

        it("should convert AliasTarget data into a simpler form", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        AliasTarget : {
                            DNSName : "fooga.com",
                            EvaluateTargetHealth : false
                        },
                        ResourceRecords : []
                    }]
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                type : "A",
                                alias : "fooga.com"
                            }
                        }
                    }
                }
            });
        });

        it("should convert AliasTarget data with a health check", function() {
            var out = transform([{
                    Name : "fooga.com.",
                    Records : [{
                        Name : "fooga.com.",
                        Type : "A",
                        AliasTarget : {
                            DNSName : "fooga.com",
                            EvaluateTargetHealth : true
                        },
                        ResourceRecords : []
                    }]
                }]);

            assert.deepEqual(out, {
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                type : "A",
                                alias : {
                                    dns : "fooga.com",
                                    health : true
                                }
                            }
                        }
                    }
                }
            });
        });
    });
});
