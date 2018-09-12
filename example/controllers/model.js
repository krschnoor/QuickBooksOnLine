var builder = require('xmlbuilder');
var fs = require('fs');
var dirPath = "O:\\BTR Program\\Client Files\\" //input1.xml


exports.storeTB = function (tb, client, callback) {




  var plAccounts = [];
  var id;
  var idx = 2


  

  plAccounts = tb.filter(function (account) {

    return account.type == "Revenue" || account.type == "Expense" || account.subtype == "Revenue" || account.subtype == "Expense"

  })

  plAccounts = plAccounts.sort(function (a, b) {
    return b.y - a.y;
  });

  plAccounts = plAccounts.sort(function (a, b) {
    return b.m - a.m;
  });

  for (i = 0; i < plAccounts.length; i++) {

    console.log("month " + plAccounts.length + plAccounts[i].m)


    var acct = [];
    var acct2 = [];


    acct = tb.filter(function (account) {

      return account.id == plAccounts[i].id && account.y * 1 == plAccounts[i].y * 1 && account.m * 1 == plAccounts[i].m * 1

    })


    acct2 = tb.filter(function (account) {

      return account.id == plAccounts[i].id && account.y * 1 == plAccounts[i].y * 1 && account.m * 1 == plAccounts[i].m * 1 - 1

    })

    var dr = 0, cr = 0, dr1 = 0, cr1 = 0

    if (acct.length > 0) {

      dr = acct[0].debit * 1
      cr = acct[0].credit * 1
      id = acct[0].id;
      console.log("account is found " + acct.length + " " + acct[0].name + " " + acct[0].type + " " + acct[0].debit + " " + acct[0].credit + " " + acct[0].date)



    }


    if (acct2.length > 0) {

      dr1 = acct2[0].debit * 1
      cr1 = acct2[0].credit * 1

      console.log("account2 is found " + acct2.length + " " + acct2[0].name + " " + acct2[0].type + " " + acct2[0].debit + " " + acct2[0].credit + " " + acct2[0].date)
    }



    plAccounts[i].debit = dr - dr1
    plAccounts[i].credit = cr - cr1

    var re = tb.filter(function (account) {

      return account.name.indexOf("Retained Earnings") >= 0 && account.y * 1 == plAccounts[i].y * 1 && account.m * 1 == plAccounts[i].m * 1

    })

    try {

      if (typeof re[0] == "undefined" || typeof re[0].debit == "undefined" || typeof re[0].credit == "undefined") {

        var tbobj = {

          name: "Retained Earnings",
          id: 20000,
          debit: dr1 || 0,
          credit: cr1 || 0,
          type: "Equity",
          date: acct[0].m + "/" + acct[0].d + "/" + acct[0].y,
          subtype: "Equity",
          m: acct[0].m * 1,
          d: acct[0].d * 1,
          y: acct[0].y * 1

        }

        tb.push(tbobj)
      }
      else {
        re[0].debit = re[0].debit * 1 + dr1;
        re[0].credit = re[0].credit * 1 + cr1;
      }

    } catch (e) { }



  }







  try {

    fs.unlinkSync(dirPath + client + "\\input1.xml");

  } catch (e) { }

  var xml = builder.create('InputTable');
  var amount, dr, cr


  for (ctr = 0; ctr < tb.length; ctr++) {



    amount = tb[ctr].debit * 1 + tb[ctr].credit * -1






    xml.ele('Row').ele('Amount').txt(amount).up()
      .ele('Account').text(tb[ctr].name).up()
      .ele('Date').text(tb[ctr].date).up()
      .ele('Type').text(tb[ctr].type).up()
      .ele('Source').text("S").up().up()


  }







  var xmldoc = xml.toString({ pretty: true });

  console.log(xmldoc)


  fs.writeFile(dirPath + client + "\\input1.xml", xmldoc, function (err) {

    if (err) {

      callback({ status: "Could not Save File" })
      return console.log(err);
    }

    console.log("The file was saved!");
    console.log("trial balance length is " + tb.length)
    callback({ status: "Download Complete." })
  });



}