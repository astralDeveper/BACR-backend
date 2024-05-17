const { Router } = require("express");
const { ErrorHandler, ResHandler } = require("../utliz/ResponseHandlers");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { checkDuplicateEmail } = require("../utliz/auth");
require("dotenv").config();
const route = Router();

route.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Bad request" });
    }

    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Bad request" });
    }

    let matchPassword = await bcrypt.compare(password, admin.password);

    if (!matchPassword) {
      return res.status(401).json({ msg: "Bad request" });
    }

    let token = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET);

    let payload = {
      token,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.post("/signup", checkDuplicateEmail, async (req, res) => {
  try {
    let data = req.body;

    let password = await bcrypt.hash(data.password, 12);

    let admin = await Admin.create({
      ...data,
      password,
    });

    let token = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET);

    let payload = {
      token,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

route.get("/refresh", async (req, res) => {
  try {
    let token = req.headers["authorization"];

    if (!token) {
      return res.status(400).json({ msg: "Bad request" });
    }

    let { _id } = JWT.verify(token, process.env.JWT_SECRET);

    if (!_id) {
      return res.status(401).json({ msg: "Authentiction faild." });
    }

    let admin = await Admin.findById(_id).select(["-password"]);

    if (!admin) {
      return res.status(400).json({ msg: "Bad request" });
    }

    let payload = {
      admin,
    };

    return ResHandler(payload, req, res);
  } catch (error) {
    return ErrorHandler(error, req, res);
  }
});

module.exports = route;
