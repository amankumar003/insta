var express = require('express');
var router = express.Router();
const userModal = require('./users');
const postModal = require('./post');
const passport = require('passport');
const localStatergy = require('passport-local'); //here allowing the user to login using the username and password
const upload = require('./multer');

passport.use(new localStatergy(userModal.authenticate())) //here sort of user is logged in using the username and password

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn, isLoggedIn, async function(req, res) {
  const user = await userModal.findOne({username: req.session.passport.user})
  const posts = await postModel.find.populate("user")
  res.render('feed', {footer: true, posts, user});// what is the meaning of this line
});

router.get('/profile',isLoggedIn, async function(req, res) {
  const user = await userModal.findOne({username: req.session.passport.user}).populate("posts"); //here we are finding the user in the database whose image is getting updated or want to edit in the profle or is logged in
  res.render('profile', {footer: true, user: user});
});

router.get('/search',isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});
router.get('/like/post:id',isLoggedIn, async function(req, res) {
  const user = await userModal.findOne({username: req.session.passport.user})
  const post = await postModal.findById(req.params.id)
  //if already liked , remove it
  //if not liked, like it 
  if(post.likes.indexOf(user_id)===-1){
    post.likes.push(user_id)
  }
  else{
    post.likes.splice(post.likes.indexOf(user_id),1) //here we are removing the like from the post only one like is removed
  }
  //now all the changes we have done by our hand we need to save all of them
  await post.save()
  res.redirect("/feed")
});
router.get('/edit',isLoggedIn, async function(req, res) {
  const user = await userModal.findOne({username: req.session.passport.user});
  res.render('edit', {footer: true, user: user});
});


router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.get('/username/:username',isLoggedIn,async function(req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i'); //here we are using the regular expression to find the username
  const users = await userModal.find({username: regex})
  res.json(users);
 
});

router.post('/register', function(req, res) {
  const userdata = new userModal({
    username: req.body.username, // the username that user enters in the form is stored in the req.body.username
    name: req.body.name,
    email: req.body.email
  });

  userModal.register(userdata, req.body.password)
    .then(function(user) {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/profile');
      });
    })
    .catch(function(err) {
      // Handle registration error
      res.redirect('/register');
    });
});



router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function(req, res) {
  // Your function code here, if needed
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
} 

router.post('/update', upload.single('image'), async function(req, res) {
  const user = await userModal.findOneAndUpdate(
    {username: req.session.passport.user},
    {username: req.body.username,
      name: req.body.name,
      bio: req.body.bio,
    }, 
    {new:true}//here we are updating the user details in the database
    ); //with this we are finding the user in the database whose image is getting updated or want to edit in the profle or is logged in
    if(req.file){
      user.profileImage = req.file.filename; //profile picture is updated
    }
    await user.save();
    res.redirect('/profile');
    
  });

router.post('/upload', upload.single('image'), async function(req, res){
  const user = await userModal.findOne({username: req.session.passport.user})// this is giving the user who is logged in
  const post = await postModal.create({
    picture: req.file.filename,
    user: user_id,
    caption: req.body.caption
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed")
});


module.exports = router;
