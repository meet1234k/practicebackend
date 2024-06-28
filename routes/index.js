var express = require('express');
var router = express.Router();
const usermodel = require('./users');
const localstrategy = require('passport-local').Strategy;
const passport = require('passport');
const session = require('express-session');
const multer = require("multer")
const upload=require("./multer")
const postsmodel=require("./posts")
passport.use(new localstrategy(usermodel.authenticate()));

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function (req, res) {
  res.render('login')
})
router.get('/forgot', function (req, res) {
  res.send("Its is under work");
})
router.get('/profile',isLoggedIn, async function (req, res) {
 const user= await usermodel.findOne({
    username:req.session.passport.user
  })
  .populate("posts")
  res.render("profile",{user})
})
router.post('/register', function (req, res) {
  const { username, email, fullname } = req.body;
  const userdata = new usermodel({ username, email, fullName: fullname });
  usermodel.register(userdata, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      })
    })
})
router.post('/upload',isLoggedIn,upload.single("file"),async function(req,res,next){
  if (!req.file){
    res.status(404).send("File is not given")
  }
  const user = await usermodel.findOne({ username: req.session.passport.user });
  const post= await postsmodel.create({
    image:req.file.filename,
    imageText:req.body.filecaption,
    user:user._id
  })
  user.posts.push(post._id)
  user.save();
  res.redirect('/profile')
})
router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res) {
})
router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())return next();
  res.redirect("/login")
}
module.exports = router;
