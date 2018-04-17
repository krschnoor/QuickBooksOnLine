var builder = require('xmlbuilder');
var fs = require('fs');
var dirPath = "O:\\BTR Program\\Client Files\\" //input1.xml


exports.storeTB = function (tb, client, callback) {


  try {

    fs.unlinkSync(dirPath + client + "\\input1.xml");

  } catch (e) { }

  var xml = builder.create('InputTable');
  var amount


  for (ctr = 0; ctr < tb.length; ctr++) {

    tb[ctr].debit != "" ? amount = tb[ctr].debit * 1 : amount = tb[ctr].credit * 1

    if (tb[ctr].type == "Asset") {

      if (tb[ctr].debit != '') {

        amount = amount
      }

      if (tb[ctr].credit != '') {

        amount = -amount
      }

    }


    if (tb[ctr].type == "Liability") {

      if (tb[ctr].debit != '') {

        amount = amount
      }

      if (tb[ctr].credit != '') {

        amount = -amount
      }

    }

    if (tb[ctr].type == "Equity") {

      if (tb[ctr].debit != '') {

        amount = amount
      }

      if (tb[ctr].credit != '') {

        amount = -amount
      }

    }


    if (tb[ctr].type == "Revenue") {

      if (tb[ctr].debit != '') {

        amount = amount
      }

      if (tb[ctr].credit != '') {

        amount = -amount
      }

    }


    if (tb[ctr].type == "Expense") {

      if (tb[ctr].debit != '') {

        amount = amount
      }

      if (tb[ctr].credit != '') {

        amount = -amount
      }

    }








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