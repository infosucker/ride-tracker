var Future = Npm.require('fibers/future');
var GmailBatch = Meteor.npmRequire('node-gmail-api');
var base64url = Meteor.npmRequire('base64-url');

var lyftQuery = "from:receipts@lyftmail.com OR from:no-reply@lyftmail.com";
var defaultMax = 100;

// refresh OAuth tokens for expired services
function refreshOAuthToken(service, user){


  function getNewAccessToken(service){
    var fut = new Future();
    if(service.name === 'google'){
      Meteor.http.post(service.url, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, content: oAuthRefreshBody(service)}, function(error, response){
        if(error){
          fut.throw(error);
        }else{
          fut.return(response.data);
        }
      });
    }
    return fut.wait();
  }


  function oAuthRefreshBody(service){
    loginServiceConfig = Accounts.loginServiceConfiguration.findOne({service: service.name});
    return  'refresh_token=' + user.services[service.name].refreshToken +
            '&client_id=' + loginServiceConfig.clientId +
            '&client_secret=' + loginServiceConfig.secret +
            '&grant_type=refresh_token';
  }


  function storeNewAccessToken(service, token){
    var o = {};
    if(service.name === 'google'){
      o['services.' + service.name + '.accessToken'] = token.access_token;
      o['services.' + service.name + '.expiresAt'] = moment().add(token.expires_in, "seconds").toDate();
      o['services.' + service.name + '.idToken'] = token.id_token;
    }

    Meteor.users.update({_id: user._id}, {$set: o});
  }

  try{
    var token = getNewAccessToken(service);
    if(token)
      storeNewAccessToken(service, token);
    return token;
  } catch(err){
    throw err;
  }
}


// filter non-receipt messages
var messageFilters = /(thanks for getting)/i;


// queries for text data from message
var textRegexQueries = [{
    field: 'driver',
    query: /thanks for riding with (.*).{1}/i,
  },{
    field: 'receipt',
    queries: [
      {query: /receipt #(.*)/i, matchType: 1},
      {query: /\d+/, matchType: 0}
    ]
  },{
    field: 'time',
    query: /line completed on (.*)/i,
  },
  {
    field: 'time2',
    query: /ride ending (.*)/i
  },{
    field: 'time3',
    query: /ride completed on (.*)/i
  },{
    field: 'time4',
    query: /line ending (.*)/i
  },{
    field: 'pickup',
    query: /pickup: (.*)/i,
  },{
    field: 'dropoff',
    query: /dropoff: (.*)/i,
  },{
    field: 'total',
    queries: [
      {
        query: /total charged to (.*)/i,
      }, {
        query: /\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/,
      }]
  },{
    field: 'total2',
    queries: [{
        query: /total charged to (.*)/i,
      },{
        query: /(\$\w+)/i, matchType: 0
      },{
        query: /\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/,
      }]
  },{
  field: 'cancelled',
    queries: [{
        query: /charges to (.*)/i,
      },{
        query: /(\$\w+)/i, matchType: 0
      },{
        query: /\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/,
        matchType: 1
      }]
  },{
    field: 'totalString',
    query: /total charged to (.*):/i,
    matchType: 0
  }];

// queries for html data from message
var htmlRegexQueries = [{
  field: 'driver_photo',
  query: /https:\/\/lyftapi.s3.amazonaws.com[\s\S]*driver.jpg/,
  matchType: 0
}];

// parse the message data to get the values you care about
function buildLyftReceipt(message){

  var receipt = _.extend(buildResults(message.text, textRegexQueries), buildResults(message.html, htmlRegexQueries), {messageDate: message.date});
  
  // if you still didn't parse the time, use the message date as the ride time and convert to Lyft style
  if(!receipt.time){
    var m = moment(message.date);
    receipt.time = m.format("MMMM D");
  }

  // log for debugging
  if(!receipt.pickup || !receipt.dropoff){
    log.info("missing pickup or dropoff: ", message.text);
  }

  if(!receipt.total && !receipt.cancelled){
    log.info("missing total: ", message.text);
  }

  if(!receipt.driver){
    log.info("missing driver: ", message.text);
  }

  if(!receipt.receipt){
    log.info("missing receipt no", message.text);
  }

  return receipt;


  function buildResults(messageData, queries){
    var results = {};
    _.each(queries, function(regex){
      var result = _.first(_.filter(messageData, function(m){
        if(regex.queries)
          return !!regex.queries[0].query.exec(m);
        return !!regex.query.exec(m);
      }));
      if(result){
        if(regex.queries){
          _.each(regex.queries, function(q){
            // if you get a match, update the result, otherwise the result is null
            try{
              result = q.query.exec(result)[(!!q.matchType || q.matchType === 0)? q.matchType: 1];
            }catch(e){
              result = null;
            }
          });
          results[regex.field] = result;
        } else {
          results[regex.field] = regex.query.exec(result)[(regex.matchType!==undefined)? regex.matchType: 1];
        }
      }
    });

    // try both ways of getting the time from the data
    var times = _.compact([results.time, results.time2, results.time3, results.time4]);
    if(times.length){
      results.time = _.first(times);
    }

    // try both ways of getting the time from the data
    var totals = _.compact([results.total, results.total2]);
    if(totals.length){
      results.total = _.first(totals);
    }else{
      if(results.cancelled){
        results.total = results.cancelled;
      }
    }

    return results;
  }
}


Meteor.methods({ 


  // refresh googgle auth tokens if they expire
  refreshGoogleOAuthToken: function(){
    var loggedInUser = Meteor.user();
    this.unblock();
    try{
      refreshOAuthToken({name: 'google', url: 'https://accounts.google.com/o/oauth2/token'}, loggedInUser);
    } catch(e){
      throw new Meteor.Error(e);
    }  
  },


  // get all lyft receipt emails from gmail
  gmail : function(query, max, retry){
    query = query? query:lyftQuery;
    max = max? max: defaultMax;
    
    var loggedInUser = Meteor.user();

    if(!loggedInUser){
      throw new Meteor.Error("unauthorized");
    }

    // set up the gmail batch query package
    var gmailBatch = new GmailBatch(loggedInUser.services.google.accessToken);
    var messageStream = gmailBatch.messages(query, {max: max});


    // store array of messages
    var messageArray = [];


    // decode the message object returned from gmail
    function decodeMessage(d){
      // find the date of the message
      var date;
      var rawDate = _.findWhere(d.payload.headers, {"name": "Date"}).value;
      if(rawDate){
        date = moment(rawDate.slice(5), "D MMMM YYYY").toDate();
      }

      // get all the html coded messages in the payload, decode them
      var html = _.flatten(_.map(_.where(d.payload.parts, {"mimeType":"text/html"}) , function(part){
        try{
          return _.difference(base64url.decode(part.body.data).split("\n"), fluff);
        }catch(e){
          console.log(part);
          console.log(e);
        }
      }));

      var fluff = ['\r', '', '--\r']; // remove all empty lines

      // get all the text objects in the payload, decode them, and remove the fluff
      var text = _.flatten(_.map(_.where(d.payload.parts, {"mimeType":"text/plain"}) , function(part){
        try{
          return _.difference(base64url.decode(part.body.data).split("\n"), fluff);
        }catch(e){
          console.log(part);
          console.log(e);
        }
      }));

      return {html: html, text: text, date: date};
    }


    // we are using async methods, so we need futures
    var fut = new Future();


    // when you receive message data, decode it and push to the messageText array
    messageStream.on('data', Meteor.bindEnvironment(function (d) {
      if(!messageFilters.exec(d.snippet)){
        var message = decodeMessage(d);
        messageArray.push(message);
      }
    }));


    // when you get an error, if the access token expired, refresh the token
    messageStream.on('error', Meteor.bindEnvironment(function (e) {
      console.log('error', e.message);

      // if access token is expired, 
      if(e.message === 'Invalid Credentials'){
        if(!retry){
          try{
            var newToken = refreshOAuthToken({name: 'google', url: 'https://accounts.google.com/o/oauth2/token'}, loggedInUser);
            fut.return(Meteor.call('gmail', query, max, true)); // you really want to retry gmail when you get the new token
          }catch(err){
            fut.throw(new Meteor.Error(err.message));
          }
        }else{
          fut.throw(new Meteor.Error({message: e.message, error: e}));
        }
      }else{
        fut.throw(new Meteor.Error({message: e.message, error: e}));
      }
    }));


    // when you're done streaming messages, return the result
    messageStream.on('finish', Meteor.bindEnvironment(function () {
      var receipts = _.map(messageArray, function(m){
        return buildLyftReceipt(m);
      });
      fut.return(receipts);
    }));


    // return the promise
    return fut.wait();
  }

});