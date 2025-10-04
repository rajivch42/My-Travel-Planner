// public/js/planner/placeHandlers.js

import { DOM, getCurrentTripId } from './domElements.js';
import { state, setPlaceToAdd, setPlaceToDelete, resetPlaceToAdd, resetPlaceToDelete } from './state.js';
import { showFlashMessage, updateTotalCost, addExpenseItem, createPlaceCardHTML } from './utils.js';

/**
 * Handle adding a place to the itinerary
 */
export async function handleAddPlace(formData) {
    const currentTripId = getCurrentTripId();
    
    try {
        const response = await fetch('/api/planner/add-place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tripId: currentTripId,
                dayId: formData.dayId,
                placeName: state.placeToAdd.name,
                googlePlaceId: state.placeToAdd.id,
                address: state.placeToAdd.address,
                rating: parseFloat(state.placeToAdd.rating),
                lat: parseFloat(state.placeToAdd.lat),
                lng: parseFloat(state.placeToAdd.lng),
                scheduledTime: formData.scheduledTime,
                cost: parseFloat(formData.cost) || 0,
                photoUrl: state.placeToAdd.photoUrl
            })
        });

        if (!response.ok) throw new Error('Server returned an error');
        
        const result = await response.json();
        
        if (result.success && result.addedPlace) {
            DOM.addModal.style.display = 'none';
            showFlashMessage("Place added successfully!");
            
            // Update the itinerary view dynamically
            updateItineraryView(result.addedPlace, formData.dayId, formData.cost);
            resetPlaceToAdd();
        } else {
            showFlashMessage(result.message || 'An error occurred.', 'error');
        }
    } catch (err) {
        console.error("Add Place Error:", err);
        showFlashMessage("A client-side error occurred. Check console.", 'error');
    }
}

/**
 * Update the itinerary view with a newly added place
 */
function updateItineraryView(addedPlace, dayId, cost) {
    const dayContainer = document.querySelector(`.day-places[data-day-id="${dayId}"]`);
    if (!dayContainer) return;
    
    // Remove "no places" message if exists
    const noPlacesMsg = dayContainer.querySelector('.no-places-message');
    if (noPlacesMsg) noPlacesMsg.remove();
    
    // Calculate new item number
    const itemCount = dayContainer.querySelectorAll('.place-card-simple').length;
    const newNumber = itemCount + 1;
    
    // Update total cost
    if (addedPlace.cost > 0) {
        updateTotalCost(addedPlace.cost);
        
        // Add to expense list
        const dayTitle = dayContainer.closest('.day-plan').querySelector('h2').textContent;
        addExpenseItem(addedPlace, dayTitle, cost);
    }
    
    // Add the new place card
    const newPlaceCard = createPlaceCardHTML(addedPlace, dayId, newNumber);
    dayContainer.insertAdjacentHTML('beforeend', newPlaceCard);
}

/**
 * Handle editing a place
 */
export async function handleEditPlace(formData) {
    try {
        const response = await fetch('/api/planner/update-place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dayId: formData.dayId,
                placeId: formData.placeId,
                scheduledTime: formData.scheduledTime,
                cost: parseFloat(formData.cost) || 0
            })
        });

        if (!response.ok) throw new Error('Server error on update');
        
        const result = await response.json();

        if (result.success && result.updatedPlace) {
            sessionStorage.setItem('flashMessage', 'Place updated successfully!');
            window.location.hash = 'itinerary';
            window.location.reload();
        } else {
            showFlashMessage(result.message || 'An error occurred.', 'error');
        }
    } catch (err) {
        showFlashMessage("A client-side error occurred.", 'error');
    }
}

/**
 * Handle deleting a place
 */
export async function handleDeletePlace() {
    try {
        const response = await fetch('/api/planner/delete-place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                dayId: state.placeToDelete.dayId, 
                placeId: state.placeToDelete.placeId 
            })
        });

        if (!response.ok) throw new Error('Server error');
        
        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('flashMessage', 'Place deleted successfully!');
            window.location.hash = 'itinerary';
            window.location.reload();
        } else {
            showFlashMessage(result.message || 'Error deleting place.', 'error');
        }
    } catch (err) {
        showFlashMessage("A client-side error occurred.", 'error');
    } finally {
        DOM.confirmModal.style.display = 'none';
        resetPlaceToDelete();
    }
}

/**
 * Handle saving trip notes
 */
export async function handleSaveNotes(notes) {
    const currentTripId = getCurrentTripId();
    
    try {
        const response = await fetch(`/api/trip/${currentTripId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes })
        });
        
        if (!response.ok) throw new Error('Server error');
        
        const result = await response.json();
        
        if (result.success) {
            showFlashMessage("Notes saved successfully!");
        } else {
            showFlashMessage("Failed to save notes.", "error");
        }
    } catch (err) {
        showFlashMessage("A client-side error occurred.", "error");
    }
}