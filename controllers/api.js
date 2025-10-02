require('dotenv').config()
const express = require('express');
const router = express.Router();
const { Client } = require("@googlemaps/google-maps-services-js");
const Trip = require('../models/trip');
const { v4: uuidv4 } = require('uuid'); 

router.get('/places/search', async (req, res) => {
    const { tripId, query, pagetoken } = req.query;

    if (!tripId) {
        return res.status(400).json({ message: "Trip ID is required." });
    }

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const client = new Client({});
        
        // --- THIS IS THE KEY LOGIC FOR PAGINATION ---
        // If a pagetoken is provided, use it. Otherwise, perform a new search.
        const searchParams = {
            key: process.env.GOOGLE_MAPS_API_KEY
        };
        if (pagetoken) {
            searchParams.pagetoken = pagetoken;
        } else {
            searchParams.query = `${query} in ${trip.destination}`;
        }
        
        const placesResponse = await client.textSearch({ params: searchParams });

        // --- THIS IS THE KEY LOGIC FOR PHOTOS ---
        // For each place, build the photo URL if a photo reference exists.
        const resultsWithPhotos = placesResponse.data.results.map(place => {
            let photoUrl = 'https://placehold.co/400x300/EFEFEF/AAAAAA?text=No+Image'; // Default placeholder
            if (place.photos && place.photos.length > 0) {
                const photoReference = place.photos[0].photo_reference;
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            }
            return { ...place, photoUrl }; // Add the new photoUrl property to the place object
        });

        // Send back both the results and the token for the next page
        res.json({
            results: resultsWithPhotos,
            nextPageToken: placesResponse.data.next_page_token
        });

    } catch (err) {
        console.error("API Search Error:", err);
        res.status(500).json({ message: "An error occurred while searching for places." });
    }
});
// In routes/api.js
// This is the "Builder" route. It saves a place to your plan.
router.post('/planner/add-place', async (req, res) => {
    try {
        const { tripId, dayId, placeName, googlePlaceId, address, rating ,lat,lng, scheduledTime, cost ,photoUrl} = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        const day = trip.itinerary.id(dayId);
        if (!day) {
            return res.status(404).json({ success: false, message: "Day not found" });
        }

        const newPlace = {
            name: placeName,
            googlePlaceId: googlePlaceId,
            address: address,
            rating: rating,
            lat: lat,
            lng: lng,
            scheduledTime: scheduledTime, // <-- ADDED
            cost: cost,
            photoUrl: photoUrl
        };

        day.places.push(newPlace);
        await trip.save();

        // =========================================================================
        // THIS IS THE FIX
        // =========================================================================
        // After saving, we find the newly created place (it's the last one in the array).
        const addedPlace = day.places[day.places.length - 1];

        // Now, we send back BOTH the success flag AND the new place data.
        res.status(200).json({ success: true, addedPlace: addedPlace });

    } catch (err) {
        console.error("!!! ADD PLACE SERVER ERROR !!!");
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred on the server." });
    }
});
// ADD THIS NEW ROUTE TO routes/api.js

router.post('/planner/update-place', async (req, res) => {
    try {
        const { dayId, placeId, scheduledTime, cost } = req.body;
        console.log(req.body);
        // Find the trip that contains the day and place
        // This query finds the trip where one of its itinerary days has a specific _id
        const trip = await Trip.findOne({ "itinerary._id": dayId });
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip or Day not found" });
        }
        
        // Find the specific day
        const day = trip.itinerary.id(dayId);
        // Find the specific place within that day's 'places' array
        const place = day.places.id(placeId);
        if (!place) {
            return res.status(404).json({ success: false, message: "Place not found" });
        }

        // Update the values
        place.scheduledTime = scheduledTime;
        place.cost = parseFloat(cost) || 0;
        
        // Save the entire trip document
        await trip.save();
        
        // Send back the updated place data
        res.status(200).json({ success: true, updatedPlace: place });

    } catch (err) {
        console.error("!!! UPDATE PLACE SERVER ERROR !!!");
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred on the server." });
    }
});
// ADD THIS NEW ROUTE TO routes/api.js
// ADD THIS NEW ROUTE to routes/api.js

router.post('/trip/:tripId/notes', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { notes } = req.body;

        // Find the trip by ID and update its overviewNotes field
        await Trip.findByIdAndUpdate(tripId, { overviewNotes: notes });

        res.json({ success: true, message: 'Notes saved successfully!' });
    } catch (err) {
        console.error("SAVE NOTES ERROR:", err);
        res.status(500).json({ success: false, message: 'Failed to save notes.' });
    }
});
router.post('/planner/delete-place', async (req, res) => {
    try {
        const { dayId, placeId } = req.body;
        
        const trip = await Trip.findOne({ "itinerary._id": dayId });
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip or Day not found" });
        }
        
        const day = trip.itinerary.id(dayId);
        
        // Mongoose's pull method removes the subdocument from the array
        day.places.pull(placeId);
        
        await trip.save();
        
        res.status(200).json({ success: true, message: "Place deleted successfully." });

    } catch (err) {
        console.error("!!! DELETE PLACE SERVER ERROR !!!");
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred on the server." });
    }
});
router.post('/trip/:tripId/share', async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found." });
        }

        // If the trip doesn't have a share token yet, create one using uuid.
        if (!trip.shareToken) {
            trip.shareToken = uuidv4();
            await trip.save();
        }

        // Construct the full, shareable URL
        const shareUrl = `${req.protocol}://${req.get('host')}/share/${trip.shareToken}`;

        // Send the URL back to the front-end JavaScript
        res.json({ success: true, shareUrl: shareUrl });

    } catch (err) {
        console.error("SHARE LINK API ERROR:", err);
        res.status(500).json({ success: false, message: "Failed to generate share link." });
    }
});
module.exports = router;