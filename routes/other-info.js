const express = require("express");

const otherInfoController = require("../controllers/other-info");

const router = express.Router();
const isAuth = require('../midlleware/is-auth');
const isAdmin = require('../midlleware/is-admin');


router.get("/staff-info",isAuth  ,   otherInfoController.getStaffInfo);

router.post("/staff-info",isAuth  ,   otherInfoController.postStaffInfo) ; 

router.get("/work-info",isAuth  ,  otherInfoController.getWorkInfo);

router.get("/covid-info",isAuth ,   otherInfoController.getCovidInfo);

router.post("/covid-info/temperature",isAuth  ,   otherInfoController.postBodyTemperature);

router.post("/covid-info/vaccineInfo",isAuth  , otherInfoController.postVaccineInfo);

router.post("/covid-info/infectCovidInfo",isAuth ,   otherInfoController.postInfectCovidInfo);

router.get('/covid-info/:orderId', isAuth, otherInfoController.getInvoice);


module.exports = router;
