const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const controller = require("./controllers/auth.js");
const dbconnection = require("./utliz/dbConnection.js");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors({origin:"*"}));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(morgan("tiny"));

app.use(controller);


app.listen(port, "0.0.0.0", function () {
    console.log('server is up...')
    dbconnection();
});

