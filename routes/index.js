var express = require('express');
var router = express.Router();
var users = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
var bookModel = require('./book.js')
var path = require('path')
var multer = require('multer')
const crypto = require('crypto')
passport.use(new localStrategy(users.authenticate()))
const mongoose = require('mongoose')


mongoose.connect("mongodb://0.0.0.0/random").then(result => {
  console.log("Connected to database")
}).catch(err => {
  console.log(err)
})
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var fn = crypto.randomBytes(20).toString('hex') + path.extname(file.originalname)
    cb(null, fn)
  }
})

const upload = multer({ storage: storage })
/* GET home page. */
router.get('/', isloggedIn, async function (req, res, next) {
  var allBooks = await bookModel.find()
  res.render('index', { books: allBooks });
});

router.post('/register', (req, res, next) => {
  var newUser = {
    //user data here
    username: req.body.username,
    contactNumber: req.body.contactNumber.replace('+91', ''),
    email: req.body.email,
    //user data here
  };
  users
    .register(newUser, req.body.password)
    .then((result) => {
      passport.authenticate('local')(req, res, () => {
        //destination after user register
        res.redirect('/');
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get('/register', (req, res, next) => {
  res.render('register')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
  (req, res, next) => { }
);

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});
function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}

router.get('/offline', (req, res, next) => {
  res.render('offline')
})

router.get('/profile', isloggedIn, async (req, res, next) => {
  var currentUser = await users.findOne({
    username: req.user.username
  }).populate('books')
  res.render('profile', { currentUser })
})

router.get('/bookDetails/:id', isloggedIn, async (req, res, next) => {
  var book = await bookModel.findOne({
    _id: req.params.id
  }).populate('owner')
  res.render('bookDetails', { book: book })
})
router.get('/addBook', isloggedIn, (req, res, next) => {
  res.render('addBook')
})
router.post('/addBook', isloggedIn, upload.single('image'), async (req, res, next) => {
  var newBook = await bookModel.create({
    title: req.body.title,
    class: req.body.class,
    board: req.body.board,
    images: req.file.filename,
    owner: req.user._id,
    desc: req.body.desc,
  })
  var owner = await users.findOne({
    username: req.user.username
  })
  owner.books.push(newBook._id)

  await owner.save()

  res.redirect('/profile')
})
module.exports = router;
