BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowConnect();

var rootUrl = __meteor_runtime_config__.ROOT_URL;
BrowserPolicy.content.allowConnectOrigin(rootUrl);
BrowserPolicy.content.allowConnectOrigin(rootUrl.replace('http', 'ws'));

BrowserPolicy.content.allowConnectOrigin("https://engine.kadira.io");
BrowserPolicy.content.allowConnectOrigin("http://localhost:3000");
BrowserPolicy.content.allowConnectOrigin("https://*.meteor.com");
BrowserPolicy.content.allowConnectOrigin("wss://*.meteor.com");

// for angular to work womp
BrowserPolicy.content.allowEval();

// for the script
BrowserPolicy.content.allowScriptOrigin("*.google-analytics.com");

//for the tracking pixel
BrowserPolicy.content.allowImageOrigin("*.google-analytics.com");
BrowserPolicy.content.allowImageOrigin("stats.g.doubleclick.net");

// for highcharts
BrowserPolicy.content.allowScriptOrigin("*.code.highcharts.com");

// for google maps
BrowserPolicy.content.allowImageOrigin("maps.googleapis.com");

// for lyft images
BrowserPolicy.content.allowImageOrigin("lyftapi.s3.amazonaws.com");

// for facebook
BrowserPolicy.content.allowScriptOrigin("*.connect.facebook.net");

// for twitter
BrowserPolicy.content.allowOriginForAll("platform.twitter.com");

// for google fonts
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");

// for facebook frames
BrowserPolicy.content.allowFrameOrigin("static.ak.facebook.com");
BrowserPolicy.content.allowFrameOrigin("*.facebook.com");
BrowserPolicy.content.allowFrameOrigin("s-static.ak.facebook.com");