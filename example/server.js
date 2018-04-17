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

require('./routes.js')(app);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})


