var express = require('express');
module.exports = function(app){

var qb = require('./controllers/app.js')
var cs = require('./controllers/csclients.js')
var tb = require('./controllers/tbdownload.js')
var db = require('./controllers/dbdownload.js')
//var port  = process.env.PORT || 3000;
 var session = require('express-session');
 

app.use('/static',express.static('./static'))
app.use('/lib',express.static('../lib'))

app.use(session({resave: false, saveUninitialized: true, secret: 'smith',cookie: { secure: false }}));

app.get('/', function(req,res){
res.render('home.html')
})

app.set('views', 'views')


app.get('/qb',qb.getQbConn);
app.get('/requestToken',qb.getToken);
app.get('/callback', qb.getTokenSecret );
app.get('/qbAccounts',qb.getQBAccounts)
app.get('/csclients',cs.getClients)
app.get('/tb',tb.getQBAccounts)
app.get('/db',db.getQBAccounts)

}

