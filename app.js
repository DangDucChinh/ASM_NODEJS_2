const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const session = require('express-session') ; 
const MONGODB_STORE = require('connect-mongodb-session')(session) ; 
const flash = require('connect-flash');
const csrf = require('csurf') ; 
const multer = require('multer');

const mongoose = require("mongoose");
const Staff = require("./models/staff");



const URI = 'mongodb+srv://Huong:zalo12345@cluster0.3me2f.mongodb.net/test' ; 



const app = express();
const store = new MONGODB_STORE({
  collection: 'sessions',
  uri: URI
});
const csrfProtection = csrf(); 


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date ().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    
  }
});


const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||    
    file.mimetype === 'image/jpg' ||      
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);   
  } else {
    cb(null, false);
  }
};




app.set("view engine", "ejs");
app.set("views", "views");

const homeRoutes = require("./routes/home");
const musterRoutes = require("./routes/muster");
const otherInfoRoutes = require("./routes/other-info");
const addStafffoRoutes = require("./routes/add-staff");
const confirm_work_hours_Routes = require('./routes/confirm-work-hours');
const errorController = require("./controllers/error");
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  store: store ,
  saveUninitialized : false , 
  resave: false , 
  secret : 'my secret'
}));

app.use(csrfProtection) ; 
app.use(flash()) ; 

app.use((req, res, next)=>{ // middleware cung cấp cho việc phân quyền
  // res.locals.isAuthenticated = req.session.isLoggedIn ; 
  // res.locals.csrfToken = req.csrfToken(); // ghi token vao locals
  // next() ; 

  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAdmin = req.session.isAdmin ; // biến locals isAdmin được gán giá trị true hay false lấy từ giá trị của chính người đăng nhập
  // có phải admin hay là ko, và được gán vào req.session.isAdmin tại Cotroller Login

  // Nếu là admin thì hiện add-staff ở nav và hiện xem nhiều người trong staff-info views
  next();
});

app.use((req, res, next)=>{
  if (!req.session.staff) { // nếu ko có session.user ( tại login ) thì next() sang các routes khác
    return next();
  }
  Staff.findById(req.session.staff._id) // nếu có session.user, tìm user đó 
    .then(staff => {
      if (!staff) {
        return next();
      }
      req.staff = staff; // nếu tìm được , gán user là req để dùng cho các req hiện tại, còn session.user là được lưu trong phiên 
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use(homeRoutes);
app.use(musterRoutes);
app.use(otherInfoRoutes);
app.use(addStafffoRoutes);
app.use(confirm_work_hours_Routes);
app.use(authRoutes);
app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});


mongoose
  .connect( URI )
      .then((a) => {
        console.log('CONNECTED MONGO !');
        app.listen(process.env.PORT || 3000, '0.0.0.0', ()=>{
          console.log('Server is running.');
        });
      })
  .catch((err) => console.log(err));


