// public/js/planner/utils.js

import { DOM } from './domElements.js';
import { CONFIG } from './config.js';

/**
 * Display a flash message to the user
 */
export function showFlashMessage(message, type = 'success') {
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    DOM.flashContainer.appendChild(flashMessage);
    setTimeout(() => flashMessage.remove(), CONFIG.FLASH_MESSAGE_DURATION);
}

/**
 * Render search results in the results container
 */
export function renderSearchResults(places, append = false) {
    if (!append) DOM.resultsContainer.innerHTML = '';
    
    if (places.length === 0 && !append) {
        DOM.resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    places.forEach(place => {
        const lat = place.geometry.location.lat;
        const lng = place.geometry.location.lng;
        const photoUrl = place.photoUrl;

        const placeCard = `
            <div class="place-result-card">
                <div class="place-result-image"><img src="${photoUrl}" alt="${place.name}"></div>
                <div class="place-info">
                    <h4>${place.name}</h4>
                    <p>${place.formatted_address || ''}</p>
                </div>
                <div class="place-actions">
                    <span>${place.rating || 'N/A'} ⭐</span>
                    <button class="btn btn-secondary add-place-btn" 
                        data-place-id="${place.place_id}" 
                        data-place-name="${place.name}"
                        data-place-address="${place.formatted_address || ''}" 
                        data-place-rating="${place.rating || 0}"
                        data-place-lat="${lat}" 
                        data-place-lng="${lng}"
                        data-place-photo-url="${photoUrl}">Add</button>
                </div>
            </div>`;
        DOM.resultsContainer.insertAdjacentHTML('beforeend', placeCard);
    });
}

/**
 * Update the total cost display
 */
export function updateTotalCost(additionalCost) {
    if (!DOM.totalCostDisplay || additionalCost <= 0) return;
    
    const currentTotalText = DOM.totalCostDisplay.textContent.replace(/[^0-9.-]+/g, "");
    let currentTotal = parseFloat(currentTotalText) || 0;
    const newTotal = currentTotal + additionalCost;
    DOM.totalCostDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;
}

/**
 * Add expense item to the budget list
 */
export function addExpenseItem(placeData, dayTitle, cost) {
    const expenseList = document.querySelector('.expense-list');
    if (!expenseList) return;
    
    const expenseItemHTML = `
        <div class="expense-item" id="expense-${placeData._id}">
            <div class="expense-info">
                <span class="expense-day-title">${dayTitle}</span>
                <p class="expense-place-name">${placeData.name}</p>
            </div>
            <div class="expense-amount">
                <p>₹${cost.toLocaleString('en-IN')}</p>
            </div>
        </div>`;
    expenseList.insertAdjacentHTML('beforeend', expenseItemHTML);
}

/**
 * Create a new place card HTML
 */
export function createPlaceCardHTML(placeData, dayId, itemNumber) {
    return `
        <div class="place-card-simple" id="place-${placeData._id}" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${placeData.photoUrl}');">
            <div class="place-number">${itemNumber}</div>
            <div class="place-details">
                <p>${placeData.name}</p>
                <small>${placeData.address || ''}</small>
                <div class="place-meta">
                    <span class="meta-item" id="time-${placeData._id}">🕒 ${placeData.scheduledTime || 'No time'}</span>
                    <span class="meta-item" id="cost-${placeData._id}">💰 ₹${placeData.cost || 0}</span>
                </div>
            </div>
            <div class="place-card-actions">
                <a href="https://www.google.com/maps?q=${placeData.lat},${placeData.lng}" class="btn-map" target="_blank"><span class="material-symbols-outlined">map</span></a>
                <button class="btn-edit-place" data-place-id="${placeData._id}" data-day-id="${dayId}" data-time="${placeData.scheduledTime || ''}" data-cost="${placeData.cost || 0}"><span class="material-symbols-outlined">edit</span></button>
                <button class="btn-delete-place" data-place-id="${placeData._id}" data-day-id="${dayId}"><span class="material-symbols-outlined">delete</span></button>
            </div>
        </div>`;
}