const Staff = require("../models/staff");
const moment = require("moment");

exports.getMuster = (req, res, next) => {
  console.log('get muster');

  Staff.findById(req.staff._id)
    .then((staff) => {
      res.render("muster/muster", {
        pageTitle: "Muster",
        path: "/muster",
        staffs: staff,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckIn = (req, res, next) => {
  console.log('get checkin');

  Staff.findById(req.staff._id)
    .then((staff) => {
      res.render("muster/checkin", {
        pageTitle: "Check In",
        path: "/muster/checkin",
        staffs: staff,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}
exports.postCheckIn = (req, res, next) => {
  console.log('post checkin');

  const workPlace = req.body.workdress;
  const startTime = new Date();

  const workStatus = true;

  const startWorkTimes = {
    startTime: startTime,
    workPlace: workPlace,
    endTime: null,
    hours: null,
  };
  req.staff
    .addStartWorkTimes(startWorkTimes, workStatus)
    .then((staff) => {

      res.render("muster/postcheckin", {
        pageTitle: "Check In",
        path: "/muster/checkin",
        staffs: staff,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}
exports.postCheckOut = (req, res, next) => {
  console.log('post checkout ');

  const index = req.staff.workTimes.findIndex((i) => i);
  const workStart = req.staff.workTimes[index].startTime;
  const workEnd = new Date();
  const start = new moment(workStart);
  const end = new moment(workEnd);
  const duration = moment.duration(end.diff(start));
  const hours = (duration.as("minutes") / 60).toFixed(2);
  const workStatus = !req.staff.workStatus;
  const newEndTime = {
    endTime: end,
    hours: hours,
  };

  console.log('Vào đây post chẹckout');
  req.staff
    .addEndTime(newEndTime, workStatus)
    .then((staff) => {
      console.log('tìm thấy staff');
      // console.log(staff);

      res.render("muster/checkout", { 
        pageTitle: "Check Out",
        path: "/muster/checkout",
        staffs: staff,
      });

    })
    .catch((err) => {
      console.log('Lỗi')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOff = (req, res, next) => {
  console.log('get off ');

  Staff.findById(req.staff._id)
    .then((staff) => {
      res.render("muster/off", {
        pageTitle: "Off",
        path: "/muster/off",
        staffs: staff,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOff = (req, res, next) => {
  console.log('post OFF');

  const dayStartLeave = new Date(req.body.offStart);
  const dayEndLeave = new Date(req.body.offEnd);
  const start = new moment(dayStartLeave);
  const end = new moment(dayEndLeave);
  const duration = moment.duration(end.diff(start));
  const totalDateLeave = duration.as("days");
  // console.log("totalDateLeave", totalDateLeave); 
  const timesLeave = req.body.timesLeave;
  const reason = req.body.reason;

  const leaveInfoList = {
    dayStartLeave: dayStartLeave,
    dayEndLeave: dayEndLeave,
    totalDateLeave: totalDateLeave,
    timesLeave: timesLeave,
    reason: reason,
  };
  req.staff
    .addLeaveInfoList(leaveInfoList)
    .then((staff) => {
      // console.log("staff1", staff);
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
