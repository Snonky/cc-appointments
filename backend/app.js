var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userAppointmentRouter = require('./routes/userAppointments');
var doctorsOfficesRouter = require('./routes/doctorsOffices');

var app = express();

function user(req, res, next) {
    // After the request is authenticated the API gateway forwards the user info
    const base64user = req.header('X-Apigateway-Api-Userinfo');
    if (base64user) {
        const user = JSON.parse(Buffer.from(base64user, 'base64').toString('ascii'));
        // Add the parsed user info to the req so the API can use it
        req.user = user;
        // Make a service to service request to get the user role
        next();
    } else {
        next();
    }
}

// FIXME change for production
app.use(cors({ origin: true }));
app.use(user);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user-appointments', userAppointmentRouter);
app.use('/doctors-offices', doctorsOfficesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500).json({ error: err });
});

module.exports = app;
