var jsonwebtoken = require('jsonwebtoken');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();
var accountKey = null;
var jwt = null;
var jwtExpiry = 0;

module.exports = {
    getServiceAccount: function () {
        return getServiceAccount();
    },
    refreshJwt: function () {
        return refreshJwt();
    },
    getJwt: function () {
        return getJwt();
    }
};


const jwtAudience = process.env.AUDIENCE;

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
                audience: jwtAudience,
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