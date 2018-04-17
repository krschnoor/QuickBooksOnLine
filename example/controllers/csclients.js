var request    = require('request'),
    qs         = require('querystring'),
    util       = require('util'),
    bodyParser = require('body-parser'),
    express    = require('express'),
    app        = express()
    var fs = require('fs');





exports.getClients = function(req,res){
 
  var dirPath = "O:\\BTR Program\\Client Files"

   fs.readdir(dirPath, function(err, items) {
   
     console.log(items);
 
      res.json(200,items)

       for (var i=0; i<items.length; i++) {
        console.log(items[i]);
       }
   });


 }
