var express = require('express');
var mysql = require('promise-mysql');
var gw_api = require('./gateway_auth.js')
var https = require('https');
const app = express();

app.get('/', (req, res) => {
res.send('API Usage: \n get /user')
});

// https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/cloud-sql/mysql/mysql/server.js


// [START cloud_sql_mysql_mysql_create_tcp]
const createTcpPool = async config => {
// Extract host and port from socket address
const dbSocketAddr = process.env.DB_HOST.split(':');
const gatewayURL = process.env.GW_URL;

// Establish a connection to the database
return await mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    host: dbSocketAddr[0], // e.g. '127.0.0.1'
    port: dbSocketAddr[1], // e.g. '3306'
    // ... Specify additional properties here.
    ...config,
});
};
// [END cloud_sql_mysql_mysql_create_tcp]

// [START cloud_sql_mysql_mysql_create_socket]
const createUnixSocketPool = async config => {
const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';

// Establish a connection to the database
return await mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    // If connecting via unix domain socket, specify the path
    socketPath: `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    // Specify additional properties here.
    ...config,
});
};
// [END cloud_sql_mysql_mysql_create_socket]
  
const createPool = async () => {
const config = {
    // [START cloud_sql_mysql_mysql_limit]
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 1000,
    // [END cloud_sql_mysql_mysql_limit]

    // [START cloud_sql_mysql_mysql_timeout]
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
    // [END cloud_sql_mysql_mysql_timeout]

    // [START cloud_sql_mysql_mysql_backoff]
    // The mysql module automatically uses exponential delays between failed
    // connection attempts.
    // [END cloud_sql_mysql_mysql_backoff]
};
if (process.env.DB_HOST) {
    return await createTcpPool(config);
} else {
    return await createUnixSocketPool(config);
}
};
  
const ensureSchema = async pool => {
// Wait for tables to be created (if they don't already exist).
await pool.query(
    "CREATE TABLE IF NOT EXISTS `userList` (`uid` varchar(255) NOT NULL,`isDoctor` tinyint(4) DEFAULT '0', PRIMARY KEY (`uid`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
);
console.log("Ensured that table 'userList' exists");
};
  
const createPoolAndEnsureSchema = async () =>
    await createPool()
    .then(async pool => {
    await ensureSchema(pool);
    return pool;
    })
    .catch(err => {
        console.log(err);
    throw err;
});

app.get('/user', async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    var sql = "SELECT * FROM userList WHERE uid=?"
    if(req.query.uid) {
        pool.query(sql, [req.query.uid ], function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            return res.status(201).send({ 
                success: "true", result: rows,
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

app.put("/user", async (req, res) => { 
    pool = pool || (await createPoolAndEnsureSchema());
    var sql = "REPLACE INTO userList VALUES (? , ?)"
    if (req.query.uid) {
        sql = sql + req.query.uid
        isDoctor = 0
        if (req.query.isDoctor) {
            isDoctor = req.query.isDoctor
        }
        pool.query(sql, [req.query.uid, isDoctor], function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            send_default_office(req.query.uid);
            return res.status(201).send({ 
                success: "true", message: "user added successfully"
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

app.delete('/user', async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    var sql = "DELETE FROM userList WHERE uid=?"
    if (req.query.uid) { 
        pool.query(sql, [req.query.uid], function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            return res.status(201).send({ 
                success: "true", message: "user removed successfully"
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

function send_default_office(uid) {
    //post an gatewayURL/doctors-offices/{officeId}
    //doctor office als json
    //owner id und name vom office rein
    p_body = JSON.stringify({
        name: "Lorem Ipsum Doctor Office",
        ownerId: uid
    });
    gw_api.getJwt().then((token) => {
        const options = {
            method: 'POST',
            hostname: gatewayURL,
            path: `/doctorOffice`,
            port: 443,
            headers: {
                "Authorization": "Bearer " + token,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
        };
        const dReq = https.request(options, dRes => {
            dRes.on('data', d => {
                let resp = null;
                try {
                    resp = JSON.parse(d);
                    console.log(resp)
                } catch (error) {
                    console.error("The response from the  User API could not be read. Is the request authenticated?")
                }
            });
        });
        dReq.write(data)
        dReq.end();
    });
};


// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool;

var PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });