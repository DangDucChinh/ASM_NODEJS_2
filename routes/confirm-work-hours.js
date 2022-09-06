const express = require("express");
const router = express.Router();
const path = require('path');
const isAuth = require('../midlleware/is-auth');
const confirm_work_hours_Controller = require("../controllers/confirm-work-hours");



router.get("/confirm-work-hours",isAuth  ,   confirm_work_hours_Controller.getConfirm_WH);

router.post("/confirm-work-hours", isAuth ,  confirm_work_hours_Controller.postConfirm_WH);

router.post("/confirm", isAuth , confirm_work_hours_Controller.postConfirm) ; // xác nhận xóa dữ liệu giờ làm 

router.post("/confirm-data", isAuth, confirm_work_hours_Controller.postConfirm_Data ) ; // xác

module.exports = router;
