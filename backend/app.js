var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var https = require('https');

var jsonwebtoken = require('jsonwebtoken');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
var accountKey = null;
var jwt = null;
var jwtExpiry = 0;

var userAppointmentRouter = require('./routes/userAppointments');
var doctorsOfficesRouter = require('./routes/doctorsOffices');

refreshJwt();

var app = express();

function getServiceAccount() {
    if (accountKey === null) {
        const serviceAccounts = firestore.collection('service-account-keys');
        return serviceAccounts.doc('service2service').get()
            .then((accountKeyRef) => {
                accountKey = accountKeyRef.data();
                return accountKey;
            })
            .catch((error) => {
                console.error("Microservice could not get service account key: " + error);
            });
    } else {
        return Promise.resolve(accountKey);
    }
}

function refreshJwt() {
    // 6h
    const jwtLifetime = 6 * 3600;
    return getServiceAccount()
        .then((key) => {
            // Sign a new JWT with the service account. The audience is the API Gateway so it can accept the jwt as an ID token
            const payload = {
                email: key['client_email'],
            };
            const options = {
                algorithm: 'RS256',
                expiresIn: jwtLifetime,
                issuer: key['client_email'],
                keyid: key['private_key_id'],
                audience: 'https://appointments-api-3es94nb1jsz7w.apigateway.cc-appointments-303011.cloud.goog',
                subject: key['client_email'],
            };
            return new Promise((resolve, reject) => {
                jsonwebtoken.sign(payload, key['private_key'], options, (err, token) => {
                    if (err) {
                        reject(err);
                    } else {
                        const now = Math.round(Date.now() / 1000);
                        jwtExpiry = now + jwtLifetime;
                        jwt = token;
                        resolve(token);
                    }
                });
            });
        })
        .catch((error) => {
            console.error("Microservice could not sign JWT: " + error);
        });
}

function getJwt() {
    if (jwt === null) {
        return refreshJwt();
    } else {
        const now = Math.round(Date.now() / 1000);
        // Refresh jwt when < 30 seconds left until expiry
        if ((jwtExpiry - now) < 30) {
            return refreshJwt();
        } else {
            return Promise.resolve(jwt);
        }
    }
}

function user(req, res, next) {
    // After the request is authenticated the API gateway forwards the user info
    const base64user = req.header('X-Apigateway-Api-Userinfo');
    if (base64user) {
        const user = JSON.parse(Buffer.from(base64user, 'base64').toString('ascii'));
        // Add the parsed user info to the req so the API can use it
        req.user = user;
        // Make a service to service request to get the user role
        getJwt().then((token) => {
            const options = {
                method: 'GET',
                hostname: 'appointments-api-gateway-9kwntilt.ew.gateway.dev',
                path: `/user?uid=${user['user_id']}`,
                port: 443,
                headers: {
                    "Authorization": "Bearer " + token,
                },
            };
            const userReq = https.request(options, userRes => {
                userRes.on('data', d => {
                    let userRole = null;
                    try {
                        userRole = JSON.parse(d);
                    } catch (error) {
                        console.error("The response from the  User API could not be read. Is the request authenticated?")
                    }
                    if (userRole?.result?.length) {
                        user.isDoctor = userRole['result'][0].isDoctor;
                    } else {
                        user.isDoctor = false;
                    }
                    next();
                });
            });
            userReq.on('error', error => {
                console.error("Microservice could not request user role info: " + error);
                next();
            })
            userReq.end();
        });
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
