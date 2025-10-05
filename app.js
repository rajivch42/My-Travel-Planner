require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local'); 
const expressError = require("./utility/expError.js")
const path = require('path');
const User = require('./models/user');
const Trip = require('./models/trip'); 
const userRoutes = require('./controllers/user.js');
const tripRoutes = require('./controllers/trip.js');
const apiRoutes = require('./controllers/api.js');
//connect
const dbUrl = process.env.ATLASDB_URL;

mongoose.connect(dbUrl)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));
// ejs 
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, '/views')); 
//public
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(methodOverride('_method'));
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60,
})
store.on("error",() => {
    console.log("ERROR IN MONGO SESSION",err);
})
//parse 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(flash());
app.use(session({
  secret: "secretCode", 
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
// authentication 
app.use(passport.initialize()); 
app.use(passport.session());    
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user; 
  next(); 
});

app.use('/', userRoutes);
app.use('/', tripRoutes);
app.use('/api', apiRoutes);
// In your routes file
// Show the form to create a new trip

app.all("*x", (req, res, next) => {
    next(new expressError(404, "Page not found"));
});
    
app.use((err,req,res,next) => {
    let {status = 500,message = "Something went wrong"} = err;
    res.status(status).render("error",{message});
});

app.listen(3000, () => {
  console.log(`🚀 Server listening on http://localhost:${3000}`);
});
// module.exports = app;
