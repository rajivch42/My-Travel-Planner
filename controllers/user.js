require('dotenv').config()
const express = require('express');
const router = express.Router();
const passport = require('passport');
const {saveRedirectUrl} = require("../middleware.js");
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
module.exports = router;
