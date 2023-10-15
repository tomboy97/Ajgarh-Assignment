const cli = require('nodemon/lib/cli');
const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432
});

client.connect(function(err){
    if(err){
        throw err;
    }
    console.log("connected to db!");
});

module.exports = {client};