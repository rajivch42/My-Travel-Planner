require('dotenv').config()
const express = require('express');
const router = express.Router();
const {isLoggedIn} = require("../middleware.js");
const Trip = require('../models/trip'); 

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userTrips = await Trip.find({ userId: req.user._id });

    res.render('home', {
      user: req.user, // Pass the user object to the template
      trips: userTrips // Pass the array of trips
    });
  } catch (err) {
    console.error(err);
    res.send("An error occurred."); // Handle errors appropriately
  }
});
router.get('/new-trip', isLoggedIn, (req, res) => {
  res.render('new-trip.ejs');
});

// Handle the form submission
// Handle the form submission to create a new trip
router.post('/new-trip', isLoggedIn, async (req, res) => {
    const { destination, startDate, endDate } = req.body;

    // Basic validation
    if (!destination || !startDate || !endDate) {
        return res.send("Please fill out all fields.");
    }

    try {
        const newTrip = new Trip({
            userId: req.user._id,
            destination: destination,
            // Create dates in a way that avoids common timezone pitfalls
            startDate: new Date(startDate + 'T00:00:00'),
            endDate: new Date(endDate + 'T00:00:00'),
            itinerary: []
        });

        // ===================================================================
        // THIS IS THE CORRECTED LOOP THAT FIXES THE "MISSING DAY 1" BUG
        // ===================================================================
        let currentDate = new Date(newTrip.startDate);
        let dayCount = 1;

        while (currentDate <= newTrip.endDate) {
            newTrip.itinerary.push({
                dayDate: new Date(currentDate), // Create a new Date object for the array
                title: `Day ${dayCount}`,
                places: []
            });
            
            // Safely increment the date by one day
            currentDate.setDate(currentDate.getDate() + 1);
            dayCount++;
        }
        // ===================================================================

        await newTrip.save();
        res.redirect('/planner/' + newTrip._id); // Redirect to the new planner page

    } catch (err) {
        console.error(err);
        res.send("Error creating trip.");
    }
});
// This route must be protected by your isLoggedIn middleware
router.get('/planner/:tripId', isLoggedIn, async (req, res) => {
    try {
        console.log("hi.......");
        // Find the trip by its ID from the URL
        const trip = await Trip.findById(req.params.tripId);

        // SECURITY CHECK: Ensure the trip exists and belongs to the logged-in user
        if (!trip) {
            // If no trip is found, it's a 404 error
            return res.status(404).send("Trip not found.");
        }
        if (trip.userId.toString() !== req.user._id.toString()) {
            // If the trip owner is not the current user, it's a 403 Forbidden error
            return res.status(403).send("You do not have permission to view this trip.");
        }

        // If everything is okay, render the planner page and pass the trip data to it
        let totalCost = 0;
         trip.itinerary.forEach(day => {
            day.places.forEach(place => {
                totalCost += place.cost || 0; // Add the cost of each place
            });
        });
        // --- END OF NEW CALCULATION ---
        // Now, we pass the 'totalCost' to the template
        res.render('planner.ejs', { 
            trip: trip,
            totalCost: totalCost // Pass the calculated total
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while loading the planner.");
    }
});
router.get('/share/:token', async (req, res) => {
    try {
        // Find the trip using the unique token from the URL
        const trip = await Trip.findOne({ shareToken: req.params.token });

        if (!trip) {
            // If no trip matches the token, show a simple error page
            return res.status(404).render('error', { message: "Shared plan not found or the link is invalid." });
        }

        // Render a new, special EJS file for sharing
        res.render('share', { trip: trip });

    } catch (err) {
        console.error("SHARE PAGE ERROR:", err);
        res.status(500).render('error', { message: "An error occurred while loading the shared trip." });
    }
});
module.exports = router;