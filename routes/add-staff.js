const express = require("express");
const router = express.Router();
const path = require('path');
const isAuth = require('../midlleware/is-auth');
const addStaffController = require("../controllers/add-staff");



router.get("/add-staff",isAuth  ,   addStaffController.getAddStaff);

router.post("/add-staff", isAuth ,  addStaffController.postAddStaff);

module.exports = router;
