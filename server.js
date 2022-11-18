/*
This file provides the optional ability to run PMAPS as a server instead of a static webpage
Make sure that node and express are installed (see package.json dependencies), and then run:

    node server.js

to run the server on localhost.

For testing, you can expose the localhost server to the internet by installing localtunnel globally:

    npm install -g localtunnel

and then in a different terminal window from the server, running:

    lt --port [port number]
*/

const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(__dirname));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 8000;
app.listen(8000, function(){
    console.log("Listening on port " + port)
});