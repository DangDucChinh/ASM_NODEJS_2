const Staff = require("../models/staff");
const { validationResult } = require('express-validator/check');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { ObjectID, ObjectId } = require("mongodb");


exports.getLogin = (req, res, next) => {
    console.log('get LOGIN');
    let message = req.flash('error');

    if (!message) {
        message = message[0];
    } else {
        message = null; // nếu ko có lời nhắn message của lỗi
    }

    res.render("auth/login", {
        pageTitle: "LOG IN",
        path: "/login",
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
  console.log('post LOGIN');

    const email = req.body.email;
    const password = req.body.password;
    const message = req.flash('error');



    const error = validationResult(req);
    if (!error.isEmpty()) { // nếu có bất kì lỗi nào của request
        console.log('lỗi từ request');

        return res.status(422).render('auth/login', {
            pageTitle: 'LOG IN',
            path: '/login',
            errorMessage: error.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: error.array()
        });
    }



    Staff.findOne({ email: email })
        .then(staff => {
            if (!staff) {
                console.log('Lỗi ko tìm dc staff có email đó ');

                return res.status(422).render('auth/login', {
                    pageTitle: 'LOG IN',
                    path: '/login',
                    errorMessage: 'Invalid message or email',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: error.array()
                });
            }

            bcrypt.compare(password, staff.password)
                .then(doMatch => { //
                    if (doMatch) { // nếu trùng khớp pass
                        console.log('\nNeu pass == pass');
                        // console.log(staff) ; 

                        req.session.isLoggedIn = true;
                        req.session.staff = staff;
                        req.session.isAdmin = staff.admin; // gán thuộc tính có phải admin hay ko lên trên
                        // req.session.isAdmin , để khi chạy tới app.js thì kiểm nghiệm với các biến locals chọc thẳng vào views

                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }

                    // nếu không trùng pass => sai email hoặc mk
                    console.log('\nNeu pass !==== pass');
                    return res.status(422).render('auth/login', {
                        pageTitle: 'LOG IN',
                        path: '/login',
                        errorMessage: 'Invalid email or password , sai mat khau vi ko trung pass!',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getSignUp = (req, res, next) => {
  console.log('get SIGN UP');

    let message = req.flash('error');
    if (!message) {
        message = message[0];
    } else {
        message = null; // nếu ko có lời nhắn message của lỗi
    }

    res.render('auth/signup', {
        pageTitle: 'SIGN UP',
        path: '/signup',
        errorMessage: message,
        validationErrors: [],
        oldInput: {
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        }
    });
}

exports.postSignUp = (req, res, next) => {
  console.log('post SIGN UP');

    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const name = req.body.name;

    const error = validationResult(req);
    console.log('Đã bấm ');

    if (!error.isEmpty()) {
        return res.status(422).render('auth/signup', {
            errorMessage: error.array()[0].msg,
            pageTitle: 'SIGN UP',
            path: '/signup',
            validationErrors: error.array(),
            oldInput: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }
        })
    }

    bcrypt.hash(password, 12)
        .then(hashedPass => {
            var id = new ObjectId();
            const staff = new Staff({
                _id: id,
                admin: true,
                email: email,
                password: hashedPass,
                inforAdmin: {
                    idAdmin: id,
                    nameAdmin: name
                },
                name: name,
                doB: new Date(1995, 04, 06),
                salaryScale: 1.5,
                startDate: new Date(2021, 10, 25),
                department: "Nhân sự",
                annualLeave: 12,
                image: "/images/messi4.jpg",
                workStatus: null,
                workTimes: [],
                totalTimesWork: null,
                leaveInfoList: [],
                bodyTemperature: [{
                    temperature: 37,
                    time: "11:27",
                    date: new Date("2016-05-18T16:00:00Z"),
                }],
                vaccineInfo: [{
                    nameVaccine1: "astra",
                    date1: new Date("2016-05-18T16:00:00Z"),
                    nameVaccine2: "astra",
                    date2: new Date("2016-05-18T16:00:00Z"),
                }],
                infectCovidInfo: [{
                    datePositive: new Date("2016-05-18T16:00:00Z"),
                    dateRecover: new Date("2016-05-18T16:00:00Z"),
                }],
            });
            return staff.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            console.log(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getNewPass = (req, res, next) => {
  console.log('get new pass');

    let message = req.flash('error');
    const error = validationResult(req);
    if (!message.isEmpty) {
        message = message[0];
    } else {
        message = null;
    }

    const email = req.staff.email;

    if (!error) {
        res.render('auth/reset', {
            pageTitle: 'RESET PASSWORD',
            path: '/reset',
            errorMessage: message,
            validationErrors: [],
            oldInput: {
                email: email,
                password: '',
                oldpass: ''
            }
        })
    }

    res.render('auth/reset', {
        pageTitle: 'RESET PASSWORD',
        path: '/reset',
        errorMessage: message,
        validationErrors: error.array(),
        oldInput: {
            email: email,
            password: '',
            oldpass: ''
        }
    });

}

exports.postNewPass = (req, res, next) => {
  console.log('post new pass');

    const email = req.staff.email;
    const password = req.body.password;
    const oldpass = req.body.oldpass;
    // console.log(oldpass);

    let message = req.flash('error');
    if (!message) {
        message = message[0];
    } else {
        message = null;
    }

    const error = validationResult(req);  // nếu validation mà sai thì yêu cầu làm lại
    console.log(error.array());
    if (!error.isEmpty) {
        return res.status(422).render('auth/reset', {
            pageTitle: 'RESET PASSWORD',
            path: '/reset',
            errorMessage: error.array()[0].msg,
            validationErrors: error.array(),
            oldInput: {
                email: req.body.email,
                oldpass: req.body.oldpass,
                password: req.body.password
            }
        })
    }


    // nếu validation đúng 
    console.log("\n : " + email);
    Staff.findOne({ email: email })
        .then(staff => {
            console.log("\n : " + email);
            if (!staff) { // nêu ko thấy staff === email
                return res.status(422).render('auth/reset', {
                    pageTitle: 'RESET PASSWORD',
                    path: '/reset',
                    errorMessage: 'Not email valid , please enter a valid email !',
                    validationErrors: [],
                    oldInput: {
                        email: req.body.email,
                        oldpass: req.body.oldpass,
                        password: req.body.password
                    }
                })
            }
            // nếu co staff = email  ;

            bcrypt.compare(oldpass, staff.password)
                .then(doMatch => {
                    if (!doMatch) { // nếu tìm được staff === email nhưng ko trùng pass

                        return res.status(422).render('auth/reset', {
                            pageTitle: 'RESET PASSWORD',
                            path: '/reset',
                            errorMessage: 'Email valid , but old password not correct ( ko đúng pass cũ ) ',
                            validationErrors: error.array(),
                            oldInput: {
                                email: req.body.email,
                                oldpass: req.body.oldpass,
                                password: req.body.password
                            }
                        })
                    }

                    // nếu trùng email và trùng pass

                    bcrypt.hash(password, 12).then(newPassHashed => {
                        staff.password = newPassHashed;
                    })
                        .then(result => {
                            staff.save();
                            console.log('Đã thay đổi mk !')
                            res.redirect('/login');
                        })
                        .catch(err => {
                            console.log('\nEmaill va old pass trung khop nhưng co loi khi tao ra newPassHashed !');
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        })

                })
                .catch(err => {
                    console.log('\nLoi ko trung khop pass tai reset password !' + err);
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                })

        })
}

exports.postLogout = (req, res, next) => {
  console.log('post LOGOUT ');

    req.session.destroy(err => {
        console.log('\nHuy session vi logout\n' + err);
        res.redirect('/login');
    });
};