var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var bCrypt = require('bcrypt-nodejs');
var multer = require('multer');
//models
var users = mongoose.model('users');
//File upload flags and config

var fileUpload = false;
var fileFilter = false;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
   if (file.fieldname == 'attach') {
      cb(null, '/home/anv13/git/dc/public/files')
    }
  },
  filename: function (req, file, cb) {
    cb(null, req.user  + Date.now() + path.extname(file.originalname))
  }
})

var fileFilter = function(req,file,cb){
	fileUpload = true;
	console.log(file);
	if (file.mimetype=="application/pdf"||file.mimetype=="image/jpeg"||file.mimetype=="image/png"||file.mimetype=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"||file.mimetype=="application/msword") {
		cb(null,true);
	} else {
		fileFilter = true;
		cb(null,false);
	}

}

var uploads = multer({
	storage:storage,
	fileFilter:fileFilter,
	limits:{
		fileSize: 2048*1024
	}
});

var upload = uploads.fields([{ name: 'attach' }]);


/* GET users listing. */
router.get('/',function(req, res, next) {
	res.render('users/index',{error:req.flash('Successful'),reg_error:req.flash('Error'),reg_success:req.flash('LoginSuccess')});
});

router.get('/register', function(req,res,next) {
	res.render('users/register',{error:req.flash('error'),reg_error:req.flash('registrationError'),reg_success:req.flash('registrationSuccess')});
});

router.get('/chat',userValidate, function(req,res,next) {
	users.findOne({'_id':req.user},function(err, user) {
		var username =user.nick;
		res.render('users/chat',{'username':username});
	});
		
});

router.post('/register', function(req, res, next) {
  // POST Request
  var nick = req.body.username;
  var confirm_password = req.body.confirm_password;
  var password = req.body.password;
  if(password.localeCompare(confirm_password)!=0){
  	req.flash('registrationError','Passwords do not match. Please Check again.');
  	res.redirect('register');
  }
  else{
  	users.findOne({'nick':nick},function(err, user) {
  		if(user!=null){
  			req.flash('registrationError','E-mail already registered. Please Register using a different E-mail or use Forgot Password for password recovery.');
  			res.redirect('register');
  		}
  		else{
		  // Database Entry
		  var user = new users({
		  	nick:nick,
		  	password:createHash(password),
		  });
		  user.save(function(err, user) {
		  	if (err){
		  		console.log(err);
		  		req.flash('error','Database Error. Please Try again or Contact Admin if it persists.');
		  		res.redirect('register');
		  	}
		  	else{
		  		req.flash('registrationSuccess','User has been added');
	  			res.redirect('register');
		  	}
		  });
		}
	});

  }
});


var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
function userValidate(req,res,next){
	users.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			res.locals.currentuser = user;
			next();
		}
		else {
      		res.redirect("/users");
		}
	});
}

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}
module.exports = router;
