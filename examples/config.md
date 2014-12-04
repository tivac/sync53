This is a markdown file solely to allow JSON w/ comments to not look totally broken on github. It should really be named `config.json`.

```js
{
    "zones" : {
        "example.com" : {
            "ttl"     : "5 minutes",
            // Whether or not this zone should be public (only really useful for EC2)
            "private" : false,
            "records" : {
                // Multiple entries for a single record are an array of objects
                "example.com" : [
                    {
                        "ttl" : "2 days",
                        // Multiple resources for a single record are an array
                        "NS" : [
                            "ns-2035.awsdns-62.co.uk",
                            "ns-706.awsdns-24.net",
                            "ns-334.awsdns-41.com",
                            "ns-1146.awsdns-15.org"
                        ]
                    },
                    {
                        // A single resource for a record can be just a string
                        "SOA" : "ns-1146.awsdns-15.org. awsdns-hostmaster.amazon.com. 2 7200 900 1209600 60",
                        "ttl" : "15 minutes"
                    }
                ],
                
                // Simple, easy records
                "thing-a.example.com." : {
                    "A" : "127.0.0.40"
                },
                
                "thing-b.example.com." : {
                    "A" : "127.0.0.40"
                }
                
                // Aliases to in-zone records can just use the `alias` property and set it to a string
                // Note that aliases need an explicit type field, it can't be differentiated from a resource
                // simply.
                "thing.1001.example.com" : {
                    "type" : "A",
                    "alias" : "thing.example.com"
                },
                
                // More complicated alias with a HealthCheck requires an object
                "thing.1002.example.com" : {
                    "type" : "A",
                    "alias" : {
                        "dns" : "thing.example.com",
                        // Health checks are currently unsupported
                        "health" : true
                    }
                },
                
                // Aliases to CloudFront distributions should point at the CloudFront
                // DNS record
                "thing.1003.example.com" : {
                    "type" : "A",
                    "alias" : "123456asdfasd.cloudfront.net"
                },
                
                // AWS supports several types of routing, sync53 supports all but failover
                // so far.
                
                // Latency based routing uses the `region` field, it should be one of:
                // "us-east-1",
                // "us-west-1",
                // "us-west-2",
                // "eu-west-1",
                // "eu-central-1",
                // "ap-southeast-1",
                // "ap-southeast-2",
                // "ap-northeast-1",
                // "sa-east-1",
                // "cn-north-1"
                "thing.example.com" : [
                    {
                        "type" : "A",
                        "id" : "DFW",
                        "region" : "us-west-1",
                        "alias" : "thing-a.example.com"
                    },
                    {
                        "type" : "A",
                        "id" : "FRA",
                        "region" : "eu-west-1",
                        "alias" : "thing-b.example.com"
                    }
                ],
                
                // Geolocation routing uses the `location` property, which is always an object
                // It have two shapes: either a single `continent` property or a `country` with an
                // optional `area`.
                // Valid continents are:
                // "AF",
                // "AN",
                // "AS",
                // "EU",
                // "OC",
                // "NA",
                // "SA"
                // Valid countries and areas are too numerous to list, so good luck.
                "geoloc.example.com": [
                    {
                        "A" : "127.0.0.9",
                        "id": "europe",
                        "location": {
                            "continent": "EU"
                        }
                    },
                    {
                        "A" : "127.0.0.10",
                        "id" : "thailand",
                        "location" : {
                            "country" : "TH"
                        }
                    },
                    {
                        "A" : "127.0.0.8",
                        "id" : "washington",
                        "location" : {
                            "country" : "US",
                            "area" : "WA"
                        }
                    }
                ],
                
                // Weighted routing uses the `weight` property with an integer value
                "weighted.example.com": [
                    {
                        "A" : "127.0.0.5",
                        "id": "weight1",
                        "weight": 1
                    },
                    {
                        "A" : "127.0.0.6",
                        "id": "weight10",
                        "weight": 10
                    },
                    {
                        "A" : "127.0.0.7",
                        "id": "weight100",
                        "weight": 100
                    }
                ]
            }
        }
    }
}
```
