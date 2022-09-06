const express = require("express");

const musterController = require("../controllers/muster");

const router = express.Router();
const isAuth = require('../midlleware/is-auth');


router.get("/muster",isAuth ,   musterController.getMuster);

router.get("/muster/checkin",isAuth ,  musterController.getCheckIn);

router.post("/muster/checkin",isAuth  ,   musterController.postCheckIn);

router.post("/muster/checkout",isAuth  ,   musterController.postCheckOut);

router.get("/muster/off",isAuth  ,   musterController.getOff);

router.post("/muster/off", isAuth  ,   musterController.postOff);

module.exports = router;
