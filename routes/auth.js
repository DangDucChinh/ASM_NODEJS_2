const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const { check, body } = require('express-validator/check');
const isAuth = require('../midlleware/is-auth');
const Staff = require('../models/staff');
const bcrypt = require('bcryptjs');


router.get('/signup', AuthController.getSignUp);

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {

            return Staff.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    console.log('\nEmail trùng rồi !');
                    return Promise.reject(
                        'E-Mail exists already, please pick a different one. And this sentence at get Sign in routes'
                    );
                }
            });
        })
        .normalizeEmail(),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
], AuthController.postSignUp);

router.get('/login', AuthController.getLogin);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address. in the post login routes')
        .normalizeEmail(),
    body('password', 'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
], AuthController.postLogin);

router.post('/logout', AuthController.postLogout);

router.get('/reset', AuthController.getNewPass);

router.post('/reset', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {

            return Staff.findOne({ email: value }).then(userDoc => {
                if (!userDoc) {
                    console.log('\nChưa đăng kí email này !');
                    return Promise.reject(
                        'E-Mail not exists already, please enter email if you had sign up ! (routest post reset) !!!'
                    );
                }
            });
        })
        .normalizeEmail(),
    body(
        'oldpass',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()
        .custom((value, { req })=>{
            // if (value !== req.staff.password) {
            //     throw new Error('Passwords have to match!');
            // }
            // return true;
            bcrypt.compare(value, req.session.staff.password)
            .then(result=>{
                if(!result){
                    throw new Error('Oldpassword have to match with password on database');
                }

                return true; 
            })
            .catch(err=>{
                console.log('\nLoi so sanh oldpass nhap voi oldpass trong data !' + err) ;
            })
        }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim()

], AuthController.postNewPass);

module.exports = router;
