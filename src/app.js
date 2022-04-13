var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {};

server.use(bodyParser.json());

server.listen(3000);
//Cambio para commit c:
module.exports = { model, server };
