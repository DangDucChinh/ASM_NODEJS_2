const Staff = require("../models/staff");
const bcrypt = require('bcryptjs');

const fileHelper = require('../util/file');

exports.getAddStaff = (req, res, next) => {
  console.log('get add staff');

  if (req.staff.admin) {
    const email = req.staff.email;
    console.log('Đã bấm add-satff');
    res.render("add-staff", {
      pageTitle: "Add Staff",
      path: "/add-staff",
      email: email , 
      idAdmin : req.staff._id ,
      nameAdmin : req.staff.name
    });
  }
};

exports.postAddStaff = (req, res, next) => {
  console.log('vào post add staff');
  
  const email = req.body.email;
  const name = req.body.name;
  const doB = req.body.doB;
  const salaryScale = req.body.salaryScale;
  const startDate = req.body.startDate;
  const department = req.body.department;
  const annualLeave = req.body.annualLeave;
  const image = req.file;
  const password = req.body.password;
  const idAdmin = req.body.idAdmin ; 
  const nameAdmin = req.body.nameAdmin ; 
 
  console.log('\nBấm post add-satff'); 
  const imageUrl = image.path ; 

  const staff = new Staff({
    email: email,
    name: name,
    password: '',
    isAdmin: false, 
    inforAdmin : {
      idAdmin : idAdmin , 
      nameAdmin : nameAdmin
    },
    doB: doB,
    isConfirm : false ,  // đã đc thay đổi giờ làm chưa ?
    salaryScale: salaryScale,
    startDate: startDate,
    department: department,
    annualLeave: annualLeave,
    image: imageUrl,
    workTimes : [],
    image: imageUrl , 
    workStatus: false,
    totalTimesWork: 0,
    leaveInfoList: [] , 
    bodyTemperature: [{
      temperature : 37 , 
      date :   new Date("2016-05-18T16:00:00Z"), 
      time : "11:00"
    }
    ] , 
    vaccineInfo: [{
      nameVaccine1: "astra" , 
      date1:  new Date("2016-05-18T16:00:00Z"), 
      nameVaccine2: "astra",
      date2:  new Date("2016-05-18T16:00:00Z")
    }] , 
    infectCovidInfo: [{
      datePositive:  new Date("2016-05-18T16:00:00Z"), 
      dateRecover:  new Date("2016-05-18T16:00:00Z"),
    }],
  });

  bcrypt.hash(password, 12).then(hashedpass => {

    if (!hashedpass) {
      console.log('\n Lỗi tại controller postAddStaff : ko thể hash dc password\n' + err);
      return res.redirect('/add-staff');
    }

    staff.password = hashedpass ; 

    staff
      .save()
      .then((result) => {
        console.log("Created Staff");
        res.redirect("/staff-info");
      })
      .catch((err) => console.log(err));

  }).catch(err => {
    console.log('\n Lỗi tại controller postAddStaff\n' + err);
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  })
};
