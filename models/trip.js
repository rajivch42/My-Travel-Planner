const mongoose = require('mongoose');

// an "embedded" document
const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  googlePlaceId: { type: String, required: true }, // From Google Places API
  address: String,
  rating: Number,
  lat: Number, // For Latitude
  lng: Number,
  scheduledTime: String, // e.g., "09:00" or "2:30 PM"
  cost: { type: Number, default: 0 },
  category: { type: String, default: 'Activity' }, // e.g., "Food", "Lodging", "Travel"
  photoUrl: String
});

// This is the schema for a single day in the itinerary, also embedded.
const daySchema = new mongoose.Schema({
  dayDate: { type: Date, required: true },
  title: { type: String, default: 'My Day Plan' }, // e.g., "Day 1: Arrival in Paris"
  places: [placeSchema] // An array of Place documents
});

// This is the MAIN schema for the entire Trip document
const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // A foreign key
    ref: 'User',                         // Links this trip to a User document
    required: true
  },
  destination: { type: String, required: true },
  googlePlaceId: String, // Main destination's ID (for "Explore" API calls)
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  shareToken: String, // A unique token for public sharing (will add later)

  overviewNotes: String, // The general "Notes" feature

  budgetTarget: { type: Number, default: 0 }, // For the budget tracker

  itinerary: [daySchema] // An array of Day documents, which contain Place documents
});

module.exports = mongoose.model('Trip', tripSchema);