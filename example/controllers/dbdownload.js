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
  store = require('./model2.js'),
  //require('dotenv').config()
  qbo;


var consumerKey = config.consumerKey,
  consumerSecret = config.consumerSecret,
  accountArray = [], tb = [], ticker

exports.getQBAccounts = function (req, res) {



  !req.session.qbo ? res.send(500,{status:"No QuickBooks Connection"}) :



    qbo = new QuickBooks(consumerKey,
      consumerSecret,
      req.session.qbo.token,
      req.session.qbo.tokenSecret,
      req.session.qbo.realmId,
      false, // use the Sandbox
      true); // turn debugging on



qbo.findAccounts({

      desc: 'MetaData.LastUpdatedTime',
      Active: false


    }, function (err, accounts) {

      accountArray = []
      tb = []

      try {
        accounts.QueryResponse.Account.forEach(function (account) {
          console.log(account)
          accountArray.push({ type: account.Classification, id: account.Id, AccountType: account.AccountType })
        })
      } catch (e) { } })





  qbo.findAccounts({

      desc: 'MetaData.LastUpdatedTime',
    


    },function (err, accounts) {


    try {
      accounts.QueryResponse.Account.forEach(function (account) {
        accountArray.push({ type: account.Classification, id: account.Id , AccountType: account.AccountType})
      })
    } catch (e) { }

    getTrialBalance(req, res, function () {

      store.storeTB(tb, req.query.client, function (status) {
        
       res.json(tb)

      })
    })


  })




}


function getTrialBalance(req, res, callback) {

  tb = [];
  var dtStart = new Date(req.query.dtStart + 1)
  var dtEnd = new Date(req.query.dtEnd)
  var yrStart = dtStart.getFullYear()
  var mnthStart = dtStart.getMonth() + 1
  var month, dy, yr

  var timeDiff = (dtEnd.getTime() - dtStart.getTime());
  var difMonths = Math.ceil(timeDiff / (1000 * 3600 * 24 * 30));

  difMonths >=0 ? null : res.send(500,{status:"Invalid Date Parameters"})
  ticker = difMonths
  console.log("ticker length " + ticker)
  for (ctr = 1; ctr <= difMonths; ctr++) {


    switch (mnthStart) {
      case 1:
        dy = 31
        month = "01"
        break;
      case 2:
        if (((yrStart % 4 == 0) && (yrStart % 100 != 0)) ||
          (yrStart % 400 == 0)) {
          dy = 29
          month = "02"
        }
        else {
          dy = 28
          month = "02"
        }
        break;
      case 3:
        dy = 31
        month = "03"
        break;
      case 4:
        dy = 30
        month = "04"
        break;
      case 5:
        dy = 31
        month = "05"
        break;
      case 6:
        dy = 30
        month = "06"
        break;
      case 7:
        dy = 31
        month = "07"
        break;
      case 8:
        dy = 31
        month = "08"
        break;
      case 9:
        dy = 30
        month = "09"
        break;
      case 10:
        dy = 31
        month = 10
        break;
      case 11:
        dy = 30
        month = 11
        break;
      case 12:
        dy = 31
        month = 12
        break;

    }



    downLoadTB(dy, month, yrStart, req, res, ctr, difMonths, callback)




    mnthStart += 1


    if (mnthStart > 12) {
      mnthStart = 1
      yrStart += 1
    }

  }

}


function downLoadTB(dy, month, yrStart, req, res, ctr, difMonths, callback) {


  qbo = new QuickBooks(consumerKey,
    consumerSecret,
    req.session.qbo.token,
    req.session.qbo.tokenSecret,
    req.session.qbo.realmId,
    false, // use the Sandbox
    true); // turn debugging on




  qbo.reportTrialBalance({ ReportBasis: "Accrual", start_date: yrStart + "-" + month + "-" + dy, end_date: yrStart + "-" + month + "-" + dy }, function (_, report) {

    var tbArray = null

    var proceed = false

      
        if (report.hasOwnProperty("Rows")) {
          if(report.Rows.hasOwnProperty("Row")){
           proceed = true }
            else{proceed = false
            ticker-=1
            ticker == 0 ? callback():null
           }
        } 
       

    if (proceed) {

      ticker -= 1

      tbArray = report.Rows.Row


      tbArray.forEach(function (row) {

        try {

          var currAccount = accountArray.filter(function (account) {

            return account.id == row.ColData[0].id

          })
        } catch (e) { }




        try {
          var name, id, debit, credit, type, category
          name = row.ColData[0].value
          id = row.ColData[0].id
          debit = row.ColData[1].value
          credit = row.ColData[2].value
          category = currAccount[0].type
          type = currAccount[0].AccountType
          m = month
          d = dy
          y = yrStart


          var tbobj = {

            name: name,
            id: id,
            debit: debit,
            credit: credit,
            category: category,
            month: m * 1,
            day:  d * 1,
            year: y * 1,
            type: type,
            date: m + "/" + d + "/" + y,
          }

       console.log("type " + type)
         

     





    switch (tbobj.type) {
      case "Accounts Receivable": 
       tbobj.name = "Receivables"
       tb.push(tbobj)
       break;
      case "Bank":
       tbobj.name = "Cash & Checking"
       tb.push(tbobj)
       break;
      case "Accounts Payable":
       tbobj.name = "Current Liabilities"
       tb.push(tbobj)
       break;
      case "Other Current Liability":
       tbobj.name = "Current Liabilities"
       tb.push(tbobj)
       break;
      case "Credit Card":
       tbobj.name = "Current Liabilities"
       tb.push(tbobj)
       break;
       case "Fixed Asset":
       tbobj.name = "Fixed Assets"
       tb.push(tbobj)
       break;
     
    }


      if(tbobj.name.indexOf("Undeposited Funds")==0){
       tbobj.name = "Cash & Checking"
       tb.push(tbobj)
       }

      if(tbobj.name.indexOf("Inventory")==0){
       tbobj.name = "Inventory"
       tb.push(tbobj)
       }
      

       if(tbobj.category.indexOf("Liability")==0){
      
          var tbobj = {

            name: "Liabilities",
            id: id,
            debit: debit,
            credit: credit,
            category: category,
            month: m * 1,
            day:  d * 1,
            year: y * 1,
            type: type,
            date: m + "/" + d + "/" + y,

          }

       tb.push(tbobj)
      }
    


   
          switch (tbobj.category) {
            case "Asset":
              tbobj.csort = 1
              break;
            case "Liability":
              tbobj.csort = 2
              break;
            case "Equity":
              tbobj.csort = 3
              break;
            
          }  


    




          console.log("Account Name :" + name)
          console.log("Account ID :" + id)
          console.log("Account Type :" + category)
          console.log("Debit Balance :" + debit)
          console.log("Credit Balance :" + credit)
          console.log("Month" + m)
          console.log("Year" + y)
          console.log("Day" + d)
          console.log("Type" + type)
          console.log("Category" + category)
          console.log("ticker" + ticker)
          console.log("\n")




        } catch (e) {

        }

      })

      if (ticker == 0) {
        console.log("equal")
        callback()
      }

    }

  })



}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
 // return true; //Object.keys(report.Rows).length > 0

   for (var key in report.Rows) {
      if (report.Rows.hasOwnProperty(key)) {
        proceed = true;
      } else { proceed = false; ticker -= 1 }
    }
}