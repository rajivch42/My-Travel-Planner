require('dotenv').config()
const express = require('express');
const router = express.Router();
const passport = require('passport');
const {saveRedirectUrl} = require("../middleware.js");
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const User = require('../models/user.js');
//connect

router.get("/signup", (req, res) => {
    res.render("auth"); // render signup.ejs
});

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username ,email});
        const registeredUser = await User.register(user, password); // passport-local-mongoose
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome, " + username);
            res.redirect("/");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// GET login form
router.get("/login", (req, res) => {
    res.render("auth"); 
});

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back, " + req.user.username);
        const redirect = res.locals.redirectUrl || "/";
        res.redirect(redirect);
    }
);

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash("success", "Logged out successfully!");
        res.redirect("/");
    });
});


// =========================================================================
// --- GOOGLE STRATEGY CONFIGURATION (UPDATED) ---
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Find a user in your database with the same Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // If the user already exists with this Google ID, log them in
            return done(null, user);
        } else {
            // --- THIS IS THE FIX ---
            // If no user with this Google ID, check if their email already exists
            let existingUser = await User.findOne({ email: profile.emails[0].value });
            if (existingUser) {
                // An account with this email already exists. Fail the login
                // and send a flash message.
                return done(null, false, { message: 'An account with that email already exists. Please log in.' });
            }
            // --- END OF FIX ---

            // If the user is completely new, create a new user account
            const newUser = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
            });
            
            await newUser.save();
            return done(null, newUser);
        }
    } catch (err) {
        return done(err, null);
    }
  }
));


// =========================================================================
// --- GOOGLE AUTHENTICATION ROUTES (UPDATED) ---
// =========================================================================

// Route 1: Starts the Google login process
router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

// Route 2: The Callback URL Google redirects to
router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/signup', // Redirect to your login/signup page on failure
    failureFlash: true, // Use flash messages for errors
    session: true
  }),
  (req, res) => {
    // On successful authentication
    req.flash('success', `Welcome back, ${req.user.username}!`);
    res.redirect('/'); // Redirect to the main dashboard
  }
);


module.exports = router;

