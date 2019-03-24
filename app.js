const config = require('config');

const express = require('express');
const path = require('path');

var passport = require('passport');
var session = require('express-session');


var cookieParser = require('cookie-parser');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.use(cookieParser());

app.use(function (req, res, next) {
    if (!req.session) {
        return next(new Error('Session initialization failed, check the server logs'));
    }
    next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

var authentication = true;

global.authentication = authentication;
global.logFailLogin = true;
global.logSuccessLogin = true;

if (authentication) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));
}

global.config = config;

require('./server/config/mariadb')();
require('./server/config/passport')(passport);

require('./server/globals');

require('./server/config/routes')(app, passport);

var fs = require('fs');

app.use('/uploads', restrict, express.static(path.join(__dirname, 'uploads')));

// Custom routes
var routes_dir = path.join(__dirname, 'server', 'custom');
fs.readdirSync(routes_dir).forEach(function (file) {
    if (file[0] === '.') return;
    require(routes_dir + '/' + file + '/routes.js')(app);
});

module.exports = app;
