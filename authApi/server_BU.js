import express from 'express';
import mysql from 'mysql';
const app = express();

var con = mysql.createConnection({
    host: process.env.CLOUD_SQL_CONNECTION_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });

app.get('/', (req, res) => {
res.send('API Usage: \n get /user')
});

app.get('/user', (req, res) => {
    var sql = "SELECT * FROM resourceMapping.userList WHERE "
    if(req.query.uid) {
        sql = sql + "uid='" + req.query.uid + "';"
        con.query(sql, function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            return res.status(201).send({ 
                success: "true", result: rows,
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

app.put("/user", (req, res) => { 
    var sql = "INSERT INTO resourceMapping.userList VALUES ('"
    if (req.query.uid) {
        sql = sql + req.query.uid
        if (req.query.isDoctor) {
            sql = sql + "', '" + req.query.isDoctor + "');"
        } else {
            sql = sql + "', '" + 0 + "');"
        }
        con.query(sql, function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            return res.status(201).send({ 
                success: "true", message: "user added successfully"
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

app.delete('/user', (req, res) => {
    var sql = "DELETE FROM resourceMapping.userList WHERE uid='"
    console.log(req.query)
    if (req.query.uid) { 
        sql = sql + req.query.uid + "';"
        con.query(sql, function (err, rows, fields) {
            if (err) return res.status(400).send({ success: "false", message: "Failed to connect to DB", });
            return res.status(201).send({ 
                success: "true", message: "user removed successfully"
            });
        });
    } else {
        return res.status(400).send({ success: "false", message: "uid is required", }); 
    }
});

var PORT = process.env.PORT || 8080
app.listen(PORT, () => {
console.log('Example app listening on port '+PORT+'!')
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
});