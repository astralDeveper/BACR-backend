const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const app = express();
const server = http.createServer(app);
const Maincontroller = require("./controllers/main");
const Authcontroller = require("./controllers/auth");
const mongoose = require("mongoose");
require("dotenv").config();
// const dbconnection = require("./utliz/dbConnection");

app.use(cors({ origin: "*" }));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(morgan("tiny"));

app.use(Maincontroller);
app.use(Authcontroller);

const start = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("connected to Database...");
      server.listen(3001);
      server.on("listening", () => {
        console.log("server is up...");
      });

      return;
    }
    console.log("alredy connected to Database...");
    server.listen(3001);
    server.on("listening", () => {
      console.log("server is up...");
    });
    return;
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

start();
