var builder = require('xmlbuilder');
var fs = require('fs');
var dirPath = "O:\\BTR Program\\Client Files\\" //input1.xml


exports.storeTB = function (tb, client, callback) {


  try {

    fs.unlinkSync(dirPath + client + "\\DashBoard.xml");

  } catch (e) { }

  var xml = builder.create('DashTable');
  var amount


  for (ctr = 0; ctr < tb.length; ctr++) {


    amount = tb[ctr].debit * 1 + tb[ctr].credit * -1

    //tb[ctr].debit != "" ? amount = tb[ctr].debit * 1 : amount = tb[ctr].credit * 1

    //if (tb[ctr].category == "Asset") {

    // if (tb[ctr].debit != '') {

    //  amount = amount
    //}

    // if (tb[ctr].credit != '') {

    //  amount = -amount
    // }

    //}


    // if (tb[ctr].category == "Liability") {

    //  if (tb[ctr].debit != '') {

    //  amount = amount
    //  }

    //  if (tb[ctr].credit != '') {

    // amount = -amount
    // }

    //}

    // if (tb[ctr].category == "Equity") {

    // if (tb[ctr].debit != '') {

    //   amount = amount
    // }

    // if (tb[ctr].credit != '') {

    //  amount = -amount
    //}


    // }






    xml.ele('Row').ele('Amount').txt(amount).up()
      .ele('Account').text(tb[ctr].name).up()
      .ele('Month').text(tb[ctr].month).up()
      .ele('Day').text(tb[ctr].day).up()
      .ele('Year').text(tb[ctr].year).up().up()


  }







  var xmldoc = xml.toString({ pretty: true });

  console.log(xmldoc)


  fs.writeFile(dirPath + client + "\\DashBoard.xml", xmldoc, function (err) {

    if (err) {

      callback({ status: "Could not Save File" })
      return console.log(err);
    }

    console.log("The file was saved!");
    console.log("trial balance length is " + tb.length)
    callback({ status: "Download Complete." })
  });



}