"use strict";

var assert    = require("assert"),
    transform = require("../src/transformers/config-to-aws"),
    
    zones = [{
        Name : "fooga.com.",
        Id   : "foogacom"
    }, {
        Name : "wooga.com.",
        Id   : "woogacom"
    }];

function compare(a, b) {
    assert.equal(a[0].HostedZoneId, b[0].HostedZoneId);
    
    assert.deepEqual(a[0].ChangeBatch.Changes, b[0].ChangeBatch.Changes);
}

describe("transformers", function() {
    describe("Config to AWS", function() {
        it("should do nothing", function() {
            assert.deepEqual(
                transform({
                    zones : {}
                }, []),
                []
            );
        });
        
        it("should handle simple configs", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : "127.0.0.1"
                                }
                            }
                        }
                    }
                }, zones);
            
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle simple configs w/ a TTL", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A   : "127.0.0.1",
                                    ttl : "15 minutes"
                                }
                            }
                        }
                    }
                }, zones);
            
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 900,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle arrays for records", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : [{
                                    A : "127.0.0.1"
                                }, {
                                    AAAA : "127.0.0.1"
                                }]
                            }
                        }
                    }
                }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }, {
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "AAAA",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle arrays of IPs", function() {
            var out = transform({
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
                }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }, {
                                Value : "127.0.0.2"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle multiple zones", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : "127.0.0.1"
                                }
                            }
                        },
                        "wooga.com" : {
                            records : {
                                "wooga.com" : {
                                    A : "127.0.0.1"
                                }
                            }
                        }
                    }
                }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }, {
                HostedZoneId : "woogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'wooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "wooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle aliases", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : {
                                        alias : "fooga.localhost"
                                    }
                                }
                            }
                        }
                    }
                }, zones);
            
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            
                            AliasTarget : {
                                DNSName              : "fooga.localhost",
                                EvaluateTargetHealth : false,
                                HostedZoneId         : "foogacom"
                            }
                        }
                    }]
                }
            }]);
        });

        it("should handle alias objects", function() {
            var out = transform({
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                A : {
                                    alias : {
                                        dns : "fooga.localhost"
                                    }
                                }
                            }
                        }
                    }
                }
            }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            
                            AliasTarget : {
                                DNSName              : "fooga.localhost",
                                EvaluateTargetHealth : false,
                                HostedZoneId         : "foogacom"
                            }
                        }
                    }]
                }
            }]);
        });

        it("should handle alias objects w/ health checks", function() {
            var out = transform({
                zones : {
                    "fooga.com" : {
                        records : {
                            "fooga.com" : {
                                A : {
                                    alias : {
                                        dns    : "fooga.localhost",
                                        health : true
                                    }
                                }
                            }
                        }
                    }
                }
            }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            
                            AliasTarget : {
                                DNSName              : "fooga.localhost",
                                EvaluateTargetHealth : true,
                                HostedZoneId         : "foogacom"
                            }
                        }
                    }]
                }
            }]);
        });

        it("should handle aliases to cloudfront", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : {
                                        alias : "fooga.cloudfront.net"
                                    }
                                }
                            }
                        }
                    }
                }, zones);
            
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            
                            AliasTarget : {
                                DNSName              : "fooga.cloudfront.net",
                                EvaluateTargetHealth : false,
                                HostedZoneId         : "Z2FDTNDATAQYW2"
                            }
                        }
                    }]
                }
            }]);
        });

        it("should handle location-based routing w/ a continent", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : "127.0.0.1",
                                    
                                    location : {
                                        continent : "NA"
                                    }
                                }
                            }
                        }
                    }
                }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            GeoLocation : {
                                ContinentCode : "NA"  
                            },
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });

        it("should handle location-based routing w/ a country/region", function() {
            var out = transform({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "fooga.com" : {
                                    A : "127.0.0.1",
                                    
                                    location : {
                                        country : "US",
                                        area    : "WA"
                                    }
                                }
                            }
                        }
                    }
                }, zones);
            
            compare(out, [{
                HostedZoneId : "foogacom",
                ChangeBatch  : {
                    Comment : "sync53-generated change for 'fooga.com' on 2015-06-25T22:35:35.521Z",
                    Changes : [{
                        Action : "UPSERT",
                        
                        ResourceRecordSet : {
                            Name : "fooga.com",
                            Type : "A",
                            TTL  : 300,
                            
                            GeoLocation : {
                                CountryCode     : "US",
                                SubdivisionCode : "WA"
                            },
                            
                            ResourceRecords : [{
                                Value : "127.0.0.1"
                            }]
                        }
                    }]
                }
            }]);
        });
    });
});
