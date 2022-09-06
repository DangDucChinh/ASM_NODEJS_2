const Staff = require("../models/staff");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');



exports.getStaffInfo = (req, res, next) => {
  console.log('get  staff infor');

  if (req.staff.admin) {
    Staff.find().then(staffs => {
      res.render("other-info/staff-info", {
        path: "/staff-info",
        pageTitle: "Staff Info",
        staffs: staffs,
      });
    })
      .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      })
  } else {

    Staff.findById(req.staff._id)
      .then((staff) => {
        console.log(staff);
        console.log("staffs-info", staff.workTimes);
        res.render("other-info/staff-info", {
          path: "/staff-info",
          pageTitle: "Staff Info",
          staff: staff,
        });
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
};

exports.postStaffInfo = (req, res, next) => {
  console.log('post staff infor');

  const imageUrl = req.file;
  const image = imageUrl.path;
  Staff.findById(req.staff._id)
    .then((staff) => {

      console.log('Đã thay đổi ảnh!');
      staff.image = image;
      // console.log(staff);
      return staff.save();
    })
    .then(() => {
      res.redirect('/staff-info');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getWorkInfo = (req, res, next) => {
  console.log('get work infor');


  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = +req.query.rowpage || 3;
  let totalItems;
  req.staff.handleTotalTimes(req.staff).then((staff) => {
    // 
    const overTime = staff.totalTimesWork > 8 ? staff.totalTimesWork - 8 : 0;
    const shortTime = staff.totalTimesWork < 8 ? staff.totalTimesWork - 8 : 0;
    const salary = staff.salaryScale * 3000000 + (overTime - shortTime) * 200000;
    staff.salary = salary ; 
    staff.save() ; 
    //
      const dataWork = staff.workTimes.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
    totalItems = staff.workTimes.length;
    // console.log(staff);

    res.render("other-info/work-info", {
      path: "/work-info",
      pageTitle: "Working Info",
      idAdmin: staff.inforAdmin.idAdmin,
      nameAdmin: staff.inforAdmin.nameAdmin,
      staffs: staff,
      dataWork: dataWork,
      ITEMS_PER_PAGE: ITEMS_PER_PAGE,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      isAuthenticated: req.session.isLoggedIn , 
    });
  }).catch(err => {
    console.log(err);
  })
}

exports.postSalary = (req, res, next) => {
  console.log('post salary');


  // console.log(req.staff);
  req.staff
    .handleTotalTimes(req.staff)
    .then((staff) => {
      // console.log("staff", staff);
      const overTime =
        staff.totalTimesWork > 8 ? staff.totalTimesWork - 8 : 0;
      const shortTime =
        staff.totalTimesWork < 8 ? staff.totalTimesWork - 8 : 0;
      const salary =
        staff.salaryScale * 3000000 + (overTime - shortTime) * 200000;
      console.log("overTime", overTime);
      console.log("shortTime", shortTime);
      res.render("other-info/work-info", {
        path: "/work-info",
        pageTitle: "Working Info",
        staffs: staff,
        salary: salary,
      });
    })

    .catch((err) => console.log(err));
};

exports.getCovidInfo = (req, res, next) => {
  console.log('get covid infor');

  Staff.find()
    .then(staffs => {
      if (req.staff.admin) {
        // console.log(staffs); 
        res.render("other-info/covid-info", {
          pageTitle: "Covid Info",
          path: "/covid-info",
          nameStaff: req.staff.name,
          staff: req.staff, // cá nhân đang requets 
          staffs: staffs
        })
      } else {
        res.render("other-info/covid-info", {
          pageTitle: "Covid Info",
          path: "/covid-info",
          nameStaff: req.staff.name,
          staff: req.staff, // cá nhân đang requets 
          staffs: []
        })
      }
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postBodyTemperature = (req, res, next) => {
  console.log('post body temperature');

  const temperature = req.body.nhietdo;
  const date = req.body.date;
  const time = req.body.time;
  const bodyTemperature = {
    temperature: temperature,
    time: time,
    date: date,
  };
  req.staff
    .addBodyTemperature(bodyTemperature)
    .then((result) => {
      console.log("CREATED bodyTemperature");
      res.redirect("/covid-info");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postVaccineInfo = (req, res, next) => {
  console.log('post vaccine infor');

  const nameVaccine1 = req.body.mui1;
  const date1 = req.body.date1;
  const nameVaccine2 = req.body.mui2;
  const date2 = req.body.date2;

  const vaccineInfo = {
    nameVaccine1: nameVaccine1,
    date1: date1,
    nameVaccine2: nameVaccine2,
    date2: date2,
  };
  req.staff
    .addVaccineInfo(vaccineInfo)
    .then((result) => {
      console.log("CREATED vaccineInfo");
      res.redirect("/covid-info");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSalary = (req, res) => {
  console.log('get salaary');

  Salary.find({ staffId: req.session.staff._id })
    .then((salary) => {
      res.render('work-info/salary', {
        path: '/work-info/salary',
        pageTitle: 'Salary Information',
        salary: salary,
      });
    })
    .catch((err) => console.log(err));
};

exports.postInfectCovidInfo = (req, res, next) => {
  console.log('post infectCovid infor');

  const datePositive = req.body.nhiemcovid;
  const dateRecover = req.body.hetbenh;
  const infectCovidInfo = {
    datePositive: datePositive,
    dateRecover: dateRecover,
  };
  req.staff
    .addInfectCovidInfo(infectCovidInfo)
    .then((result) => {
      console.log("CREATED addInfectCovidInfo");
      res.redirect("/covid-info");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getInvoice = (req, res, next) => {
  console.log('get Invoice Report Staff work infor');
  
  const staffId = req.params.orderId;
  Staff.findById(staffId)
    .then(staff => {

      if (!staff) {
        return next(new Error('No order found.')); //lỗi ko tim thấy staff 
      }
      const invoiceName = 'Report-' + staffId + '.pdf'; // tên của báo cáo 
      const invoicePath = path.join('data', 'invoices', invoiceName); // dường dẫn báo cáo trên URL

      const pdfDoc = new PDFDocument(); // khởi tạo 1 đối tượng trên doc
      res.setHeader('Content-Type', 'application/pdf'); // cài đtặ sosdoi tuowngh trnee đc
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Report : ', {
        underline: true
      });
      pdfDoc.text('----------------------------------------------------------------------------\n');
      pdfDoc.text('\n\nThong tin than nhiet va co the : ') ;
      pdfDoc.text("Name : " + staff.name);
      let element = staff.bodyTemperature; // mảng các phần tử 

      pdfDoc.text("Temperature : " + element[element.length - 1].temperature + "^C");
      pdfDoc.text("Date : " + element[element.length - 1].date.getDate() + " / " + element[element.length - 1].date.getMonth() + " / " + element[element.length - 1].date.getFullYear());
      pdfDoc.text("Hour : " + element[element.length - 1].time);


      let elementt = staff.vaccineInfo;  // mảng các phần tử của covid 
      pdfDoc.text('-------------------------------------------') ;
      pdfDoc.text('\nThong tin tiem covid : ') ;
      pdfDoc.text("Name of vaccince 1 : " + elementt[elementt.length - 1].nameVaccine1);
      pdfDoc.text("Date 1 : " + elementt[elementt.length - 1].date1.getDate() + " / " + elementt[elementt.length - 1].date1.getMonth() + " / " + elementt[elementt.length - 1].date1.getFullYear());
      pdfDoc.text("Name of vaccince 2 : " + elementt[elementt.length - 1].nameVaccine2);
      pdfDoc.text("Date 2 : " + elementt[elementt.length - 1].date2.getDate() + " / " + elementt[elementt.length - 1].date2.getMonth() + " / " + elementt[elementt.length - 1].date2.getFullYear());
      
      let element1 = staff.infectCovidInfo ; 
      pdfDoc.text('-------------------------------------------') ;
      pdfDoc.text('\nThong tin nhiem covid : ') ;
      pdfDoc.text("Day of infection with covid : " + element1[element1.length - 1].datePositive.getDate() + " / " + element1[element1.length - 1].datePositive.getMonth() + " / " + element1[element1.length - 1].datePositive.getFullYear());
      pdfDoc.text("Day of free from infection with covid : " + element1[element1.length - 1].dateRecover.getDate() + " / " + element1[element1.length - 1].dateRecover.getMonth() + " / " + element1[element1.length - 1].dateRecover.getFullYear());
      
      pdfDoc.text('\n---');
      pdfDoc.end();
    })
    .catch(err=>{
      console.log(err) ; 
      next(err) ; 
    })
    

};

