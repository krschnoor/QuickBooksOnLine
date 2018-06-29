var http = require('http'),
  port = process.env.PORT || 3000,
  request = require('request'),
  qs = require('querystring'),
  util = require('util'),
  bodyParser = require('body-parser'),
  express = require('express'),
  app = express(),
  QuickBooks = require('../../index'),
  session = require('express-session'),
  config = require('../config.js'),
  //require('dotenv').config()
  qbo;

var consumerKey = config.consumerKey
consumerSecret = config.consumerSecret


exports.getQbConn = function (req, res) {

  console.log("here" + QuickBooks.APP_CENTER_BASE)
  res.render('intuit.ejs', { locals: { port: port, appCenter: 'https://appcenter.intuit.com' } })
  console.log("here")
}

exports.getToken = function (req, res) {
  var postBody = {
    url: QuickBooks.REQUEST_TOKEN_URL,
    oauth: {
      callback: 'http://localhost:' + port + '/callback/',
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    }
  }
  request.post(postBody, function (e, r, data) {
    var requestToken = qs.parse(data)
    req.session.oauth_token_secret = requestToken.oauth_token_secret
    console.log(requestToken)
    res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
  })
}


exports.getTokenSecret = function (req, res) {

  var postBody = {
    url: QuickBooks.ACCESS_TOKEN_URL,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: req.query.oauth_token,
      token_secret: req.session.oauth_token_secret,
      verifier: req.query.oauth_verifier,
      realmId: req.query.realmId
    }
  }
  request.post(postBody, function (e, r, data) {
    var accessToken = qs.parse(data)
    console.log(accessToken)
    console.log(postBody.oauth.realmId)

    // save the access token somewhere on behalf of the logged in user
    qbo = new QuickBooks(consumerKey,
      consumerSecret,
      accessToken.oauth_token,
      accessToken.oauth_token_secret,
      postBody.oauth.realmId,
      false, // use the Sandbox
      true); // turn debugging on



    req.session.qbo = qbo

    req.session.save();



    console.log("qb saved")






  })



  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')

}



exports.getQBAccounts = function (req, res) {

  !req.session.qbo ? null :

    qbo = new QuickBooks(consumerKey,
      consumerSecret,
      req.session.qbo.token,
      req.session.qbo.tokenSecret,
      req.session.qbo.realmId,
      false, // use the Sandbox
      true); // turn debugging on



  //  qbo.findAccounts(function (_, accounts) {

  //  console.log("here is list")

  // accounts.QueryResponse.Account.forEach(function (account) {
  //  console.log(account.Id + " " + account.Name)

  // })
  // })

  qbo.findAccounts({

    desc: 'MetaData.LastUpdatedTime',
    Active: false


  }, function (err, accounts) {
    accounts.QueryResponse.Account.forEach(function (account) {
      //console.log(account.Name + " " + account.Id)
      console.log(account)
    })
  })

  // qbo.reportAccountListDetail (function (_, accounts) {

  //  console.log("here is list")

  //  accounts.QueryResponse.Account.forEach(function (account) {
  //    console.log(account)

  // })
  // })

}


