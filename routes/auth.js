var passport = require('passport'),
LocalStrategy   = require('passport-local').Strategy;
var mongoose = require('mongoose');
var users = mongoose.model('users');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var moment = require('moment');

// User
passport.serializeUser(function(user, done) {
        console.log('serializing user..');
        done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  //console.log("deserializing " + obj);
  done(null, obj);
});

passport.use('userlogin',new LocalStrategy(
    function(username, password, done) { 
        console.log(username);
        console.log(password);
        console.log("i am here");
        users.findOne({ 'nick' :  username },
            function(err, user) {
                if (err)
                    return done(err);
                if (!user){
                    return done(null, false, { message: 'Incorrect Username/Password. Please try again.' });               
                }
                if (!isValidPassword(user, password)){
                    return done(null, false, { message: 'Incorrect Password. Please try again.' });
                }
                return done(null, user);
            }
        );

    })
);

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}

module.exports = passport;

