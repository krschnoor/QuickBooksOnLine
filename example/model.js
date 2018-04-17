var builder = require('xmlbuilder');
var fs     = require('fs');
var dirPath = "O:\\BTR Program\\input.xml"


exports.storeTB= function(tb){



var xml = builder.create('InputTable');

xml.ele('Row')


var xmldoc = xml.toString({ pretty: true }); 
           
   fs.writeFile(dirPath, xmldoc, function(err) {

     if(err) { return console.log(err); } 

      console.log("The file was saved!");
    }); 


}