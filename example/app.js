var http = require('http'),
  port = process.env.PORT || 3000,
  request = require('request'),
  qs = require('querystring'),
  util = require('util'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  express = require('express'),
  app = express(),
  QuickBooks = require('../index')
  model =  require('./model')


// Generic Express config
app.set('port', port)
app.set('views', 'views')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser('brad'))
app.use(session({ resave: false, saveUninitialized: false, secret: 'smith' }));
app.engine('.html', require('ejs').renderFile);
app.set('view engine','html')
app.use('/static',express.static('./static'))

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

// INSERT YOUR CONSUMER_KEY AND CONSUMER_SECRET HERE

var consumerKey = 'qyprd3mvpx9JQIkkosKWAZLdsRJPvN',
  consumerSecret = 'oYlmAiVD063SST0nCcxj2ADlc5PwFYOlbLTq2Rz1'

app.get('/', function (req, res) {
 
 res.render('home.html')
 // res.redirect('/start');
})

app.get('/qb', function (req, res) {
 
 
  res.redirect('/start');
})

app.get('/start', function (req, res) {
  res.render('intuit.ejs', { port: port, appCenter: QuickBooks.APP_CENTER_BASE })
})

app.get('/requestToken', function (req, res) {
  var postBody = {
    url: QuickBooks.REQUEST_TOKEN_URL,
    oauth: {
      callback: 'http://10.1.2.68:' + port + '/callback/',
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
})

app.get('/callback', function (req, res) {
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


    

    var accountArray = []

    // test out account access
    req.session.qbo.findAccounts(function (_, accounts) {

      console.log("here is list")

      accounts.QueryResponse.Account.forEach(function (account) {
        console.log(account.Id)
        accountArray.push({ type: account.Classification, id: account.Id })
      })

      console.log("length of accountArray is" + accountArray.length)

   
    for(ctr=7;ctr<=8;ctr++){

      getTrialBalance(ctr,req,accountArray)

    }

    })

    

    
   
  })



  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
})





function getTrialBalance(ctr,req,accountArray) {

    
      console.log("session onbject" + req.session.qbo)
     

      req.session.qbo.reportTrialBalance({ ReportBasis: "Accrual", start_date: "2017-0" + ctr +"-01", end_date: "2017-0" + ctr +"-31" }, function (_, report) {

        var tbArray = report.Rows.Row


        tbArray.forEach(function (row) {

          try {
            //console.log(row.ColData[0].id)

            var currAccount = accountArray.filter(function (account) {

              return account.id == row.ColData[0].id

            })
          } catch (e) { }




          try {
            var name, id, debit, credit, type
            name = row.ColData[0].value
            id = row.ColData[0].id
            debit = row.ColData[1].value
            credit = row.ColData[2].value
            category = currAccount[0].type

            console.log("Account Name :" + name)
            console.log("Account ID :" + id)
            console.log("Account Type :" + category)
            console.log("Debit Balance :" + debit)
            console.log("Credit Balance :" + credit)
            console.log("\n")

            model.storeTB(name)

          } catch (e) {

          }

        })


      })
    }



    