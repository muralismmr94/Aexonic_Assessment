const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./Routes/route");
const port = require("./Config.json").PortNo;

var app = express(); 
app.use(cors());
app.use(bodyparser.json());
//Routes
app.use("/", routes);

//MongoDb connection
mongoose.connect("mongodb://localhost/test", { useNewUrlParser: true });
mongoose.connection
  .once("open", function () {
    console.log("Database connected Successfully");
  })
  .on("error", function (err) {
    console.log("Error", err);
  });
//Server
app.listen(port, function (req, res) {
  console.log("Serve is up and running at the port " + port);
});
module.exports = app;
