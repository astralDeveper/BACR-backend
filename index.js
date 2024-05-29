const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const AuthController = require("./controllers/auth.js");
const CrudController = require("./controllers/main.js");
const dbconnection = require("./utliz/dbConnection.js");
const app = express();

const port = process.env.PORT || 3001;

app.use(cors({origin:"*"}));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(morgan("tiny"));

app.get("/",(req,res)=>{
    return res.status(200).json({
        msg:"server is up"
    })
})

app.use("/auth", AuthController);
app.use("/api", CrudController);


app.listen(port, "0.0.0.0", function () {
    console.log('server is up...')
    dbconnection();
});

