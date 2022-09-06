const Staff = require("../models/staff");
const bcrypt = require('bcryptjs');

const fileHelper = require('../util/file');

exports.getConfirm_WH = (req, res, next) => {
  console.log('get confirm theo work hours');

    Staff.find()
        .then(staffs => {
            res.render('confirm-work-hours', {
                pageTitle: "CONFIRM-WORK-HOURS",
                path: "/confirm-work-hours",
                staffs: staffs,
                staff_id: '12345'
            });
        })
        .catch(err => {
            console.log('\n Lỗi tại controller get confirm-work-hours\n');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postConfirm_WH = (req, res, next) => {
  console.log('post confirm theo work hours');

    const seleted_Id = req.body.staff_id;

    Staff.find()
        .then(staffs => {
            console.log('POST TED')
            return res.render('confirm-work-hours', {
                pageTitle: "CONFIRM-WORK-HOURS",
                path: "/confirm-work-hours",
                staffs: staffs,
                staff_id: seleted_Id
            });
        })
        .catch(err => {
            console.log('\n Lỗi tại controller get confirm-work-hours\n');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.postConfirm = (req, res, next) => {
  console.log('post confirm');


    const staff_id = req.body.staff_id;
    Staff.findById(staff_id)
        .then(staff => {

            let mang = [];
            mang = staff.workTimes ; 
            staff.workTimes = mang.filter(item => item.isConfirm !== false); 
            // console.log(staff.workTimes) ;
            return staff.save() ; 

        })
        .then(result => {
            console.log('Đã xóa hết dữ liệu giờ làm tại post delete confirm-work-hours');
            res.redirect('confirm-work-hours');
        })
        .catch(err => {
            console.log('\n Lỗi tại controller post delete confirm-work-hours\n' + err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })

}

exports.postConfirm_Data = (req, res, next) => {
  console.log('post confirm data ');


    Staff.findById(req.body.staff_id) // tìm kiếm id của người được chọn
        .then(staff => {

            staff.workTimes.forEach(element => {
                element.isConfirm = true ; 
            });
            // console.log("\n=>"+staff.workTimes); 
            return staff.save();

        })
        .then(result => {
            res.redirect('/confirm-work-hours');
        })
        .catch(err => {
            console.log('\n Lỗi tại controller post confirm-datta\n' + err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}