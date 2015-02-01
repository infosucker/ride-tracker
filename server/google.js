var Future = Npm.require('fibers/future');
var GmailBatch = Meteor.npmRequire('node-gmail-api');
var base64url = Meteor.npmRequire('base64-url');


var lyftQuery = "from:receipts@lyftmail.com OR from:no-reply@lyftmail.com";
var defaultMax = 100;

// refresh OAuth tokens for expired services
function refreshOAuthToken(service, user){


  function getNewAccessToken(service){
    console.log('refreshing google access tokens');
    if(service.name === 'google'){

      try{
        var result = Meteor.http.post(service.url, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, content: oAuthRefreshBody(service)});
        console.log('result', result);
        return result.data;
      } catch(e){
        throw new Meteor.Error(e.message);
      }
    }


   function oAuthRefreshBody(service){
      loginServiceConfig = Accounts.loginServiceConfiguration.findOne({service: service.name});
      return  'refresh_token=' + user.services[service.name].refreshToken +
              '&client_id=' + loginServiceConfig.clientId +
              '&client_secret=' + loginServiceConfig.secret +
              '&grant_type=refresh_token';
    }
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

  var token = getNewAccessToken(service);
  storeNewAccessToken(service, token);
  return token;
}


// queries for text data from message
var textRegexQueries = [{
    field: 'driver',
    query: /thanks for riding with (.*).{1}/i,
  },{
    field: 'receipt',
    query: /receipt #(.*)/i,
  },{
    field: 'time',
    query: /line completed on (.*)/i,
  },{
    field: 'pickup',
    query: /pickup: (.*)/i,
  },{
    field: 'dropoff',
    query: /dropoff: (.*)/i,
  },{
    field: 'total'
  }];

var totalQuery1 = /total charged to (.*)/i;
var totalQuery2 = /\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/;
_.last(textRegexQueries).query = {0: totalQuery1, 1: totalQuery2};

// queries for html data from message
var htmlRegexQueries = [{
  field: 'driver_photo',
  query: /https:\/\/lyftapi.s3.amazonaws.com[\s\S]*driver.jpg/,
  matchType: 0
}];

// parse the message data to get the values you care about
function buildLyftReceipt(message){

  return _.extend(buildResults(message.text, textRegexQueries), buildResults(message.html, htmlRegexQueries));

  function buildResults(messageData, queries){
    var results = {};
    _.each(queries, function(regex){
      var result = _.first(_.filter(messageData, function(m){
        if(_.values(regex.query).length > 1)
          return !!regex.query[0].exec(m);
        return !!regex.query.exec(m);
      }));
      if(result){
        if(_.values(regex.query).length > 1){
          _.each(regex.query, function(q){
            result = q.exec(result)[(regex.matchType!==undefined)? regex.matchType: 1];
          });
          results[regex.field] = result;
        } else {
          results[regex.field] = regex.query.exec(result)[(regex.matchType!==undefined)? regex.matchType: 1];
        }
      }
    });
    return results;
  }
}


Meteor.methods({ 


  // refresh googgle auth tokens if they expire
  refreshGoogleOAuthToken: function(){
    var loggedInUser = Meteor.user();
    return refreshOAuthToken({name: 'google', url: 'https://accounts.google.com/o/oauth2/token'}, loggedInUser);
  },


  // get all lyft receipt emails from gmail
  gmail : function(query, max){
    var loggedInUser = Meteor.user();


    // set up the gmail batch query package
    var gmailBatch = new GmailBatch(loggedInUser.services.google.accessToken);
    var messageStream = gmailBatch.messages((query? query:lyftQuery), {max: (max? max: defaultMax)});


    // store array of messages
    var messageArray = [];


    // decode the message object returned from gmail
    function decodeMessage(d){

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

      return {html: html, text: text};
    }


    // we are using async methods, so we need futures
    var fut = new Future();


    // when you receive message data, decode it and push to the messageText array
    messageStream.on('data', Meteor.bindEnvironment(function (d) {
      var message = decodeMessage(d);
      messageArray.push(message);
    }));


    // when you get an error, if the access token expired, refresh the token
    messageStream.on('error', Meteor.bindEnvironment(function (e) {
      console.log('error', e.message);

      // if access token is expired, 
      if(e.message === 'Invalid Credentials'){
        var newToken = refreshOAuthToken({name: 'google', url: 'https://accounts.google.com/o/oauth2/token'}, loggedInUser);
        console.log(newToken);
        fut.throw(new Meteor.Error("access token refreshed", e)); // you really want to retry gmail when you get the new token
      }else{
        fut.throw(new Meteor.Error({message: e.message, error: e}));
      }
    }));


    // when you're done streaming messages, return the result
    messageStream.on('finish', Meteor.bindEnvironment(function () {
      var receipts = _.map(messageArray, function(m){
        return buildLyftReceipt(m);
      });
      console.log(receipts);
      fut.return(receipts);
    }));


    // return the promise
    return fut.wait();
  }

});