const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const controller = require("./controllers/auth.js");
const dbconnection = require("./utliz/dbConnection.js");
const app = express();

app.use(cors({origin:"*"}));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(morgan("tiny"));

app.use(controller);

dbconnection();

app.listen(3000);
app.on("listening", ()=>{
    console.log("server is up...");
})
