// --- 1. GET ALL DOM ELEMENTS ---
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const plannerViews = document.querySelectorAll('.planner-view');
const plannerHeader = document.getElementById('planner-header');
const plannerWrapper = document.querySelector('.planner-wrapper');
const currentTripId = plannerWrapper ? plannerWrapper.dataset.tripId : null;

// Overview Tab Elements
const categoryGrid = document.querySelector('.category-grid');
const searchInput = document.getElementById('place-search-input');
const searchButton = document.getElementById('place-search-button');
const saveNotesBtn = document.getElementById('save-notes-btn');
const notesTextarea = document.getElementById('trip-notes-textarea');
const overviewControls = document.getElementById('overview-controls');
const resultsContainer = document.getElementById('search-results-container');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');
let isInitialSearchPerformed = false;
// Flash Messages
const flashContainer = document.getElementById('flash-message-container');
// Add this with your other const declarations
const sharePlanBtn = document.getElementById('share-plan-btn');
// Modals
// Add this with your other 'const' declarations at the top
const totalCostDisplay = document.querySelector('.total-cost-display');
const addModal = document.getElementById('add-place-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const addPlaceForm = document.getElementById('add-place-form');
const editModal = document.getElementById('edit-place-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const editPlaceForm = document.getElementById('edit-place-form');
const confirmModal = document.getElementById('confirm-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

const shareModal = document.getElementById('share-modal');
const closeShareModalBtn = document.getElementById('close-share-modal-btn');
const shareUrlInput = document.getElementById('share-url-input');
const copyLinkBtn = document.getElementById('copy-link-btn');

// State Management
let placeToAdd = {};
let placeToDelete = {};
let currentQuery = '';
let nextPageToken = null;
let isLoading = false;
let lastSearchResults = [];

// --- 2. HELPER FUNCTIONS ---
function showFlashMessage(message, type = 'success') {
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    flashContainer.appendChild(flashMessage);
    setTimeout(() => flashMessage.remove(), 3000);
}

function renderSearchResults(places, append = false) {
    if (!append) resultsContainer.innerHTML = '';
    if (places.length === 0 && !append) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
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
        resultsContainer.insertAdjacentHTML('beforeend', placeCard);
    });
}

async function performSearch(query, pageToken) {
    if (isLoading || !currentTripId) return;
    isLoading = true;
    
    if (pageToken) {
        loadMoreBtn.textContent = 'Loading...';
    } else {
        resultsContainer.innerHTML = '<p>Searching...</p>';
        currentQuery = query;
    }
    
    let url = `/api/places/search?tripId=${currentTripId}`;
    url += pageToken ? `&pagetoken=${pageToken}` : `&query=${query}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        renderSearchResults(data.results, !!pageToken);
        nextPageToken = data.nextPageToken;
        loadMoreContainer.style.display = nextPageToken ? 'block' : 'none';
        lastSearchResults = pageToken ? lastSearchResults.concat(data.results) : data.results;
    } catch (err) {
        resultsContainer.innerHTML = '<p style="color: red;">Error: Could not find places.</p>';
    } finally {
        isLoading = false;
        loadMoreBtn.textContent = 'Load More';
    }
}

// --- 3. EVENT LISTENERS ---

// Sidebar Navigation
if (sidebarLinks.length) {
    sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetView = link.dataset.view;
        
        sidebarLinks.forEach(l => l.classList.remove('active'));
        plannerViews.forEach(v => v.classList.remove('active'));
        if (overviewControls) overviewControls.classList.remove('active');
        
        link.classList.add('active');
        document.getElementById(targetView + '-view').classList.add('active');
        
        // =========================================================================
        // --- THIS IS THE UPDATED LOGIC ---
        // =========================================================================
        if (targetView === "overview") {
            plannerHeader.textContent = "Overview & Notes";
            if (overviewControls) overviewControls.classList.add('active');

            // If the user has NOT performed a search yet in this session...
            if (lastSearchResults.length === 0 && !isInitialSearchPerformed) {
                // Find the 'Restaurants' button and programmatically click it.
                const restaurantButton = document.querySelector('.category-btn[data-query="restaurants"]');
                if (restaurantButton) {
                    restaurantButton.click();
                }
                // Set the flag to true so this never runs again.
                isInitialSearchPerformed = true;
            } 
            // If the user has already searched, just restore their last results.
            else if (lastSearchResults.length > 0) {
                renderSearchResults(lastSearchResults, false);
            }

        } else if (targetView === "itinerary") {
            plannerHeader.textContent = "Your Itinerary";
        } else if (targetView === "budget") {
            plannerHeader.textContent = "Budget Tracker";
        }
    });
});
}

// Overview Sub-tabs (Explore/Notes)
const overviewSubNav = document.querySelector('.overview-sub-nav');
if (overviewSubNav) {
    overviewSubNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('sub-tab-btn')) {
            document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.overview-sub-view').forEach(view => view.classList.remove('active'));
            
            const subviewId = e.target.dataset.subview;
            e.target.classList.add('active');
            document.getElementById(subviewId).classList.add('active');
        }
    });
}

// Category Buttons
if (categoryGrid) {
    categoryGrid.addEventListener('click', (e) => {
        const categoryButton = e.target.closest('.category-btn');
        if (categoryButton) {
            // --- THIS IS THE NEW LINE ---
            // It saves the clicked category (e.g., 'attractions') to the browser's session memory.
            sessionStorage.setItem('lastPlannerCategory', categoryButton.dataset.query);

            categoryGrid.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
            categoryButton.classList.add('selected');
            performSearch(categoryButton.dataset.query, null);
        }
    });
}

// Search Button
if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
            performSearch(query, null);
        }
    });
}

// Load More Button
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        if (nextPageToken) performSearch(null, nextPageToken);
    });
}

// Save Notes Button
if (saveNotesBtn && notesTextarea) {
    saveNotesBtn.addEventListener('click', async () => {
        const notesContent = notesTextarea.value;
        try {
            const response = await fetch(`/api/trip/${currentTripId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: notesContent })
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
    });
}

// Global Click Handler (Add/Edit/Delete buttons)
document.addEventListener('click', (e) => {
    const addButton = e.target.closest('.add-place-btn');
    const editButton = e.target.closest('.btn-edit-place');
    const deleteButton = e.target.closest('.btn-delete-place');
    const addPlaceToDayBtn = e.target.closest('.btn-add-place-to-day');

    if (addButton) {
        placeToAdd = {
            name: addButton.dataset.placeName,
            id: addButton.dataset.placeId,
            address: addButton.dataset.placeAddress,
            rating: addButton.dataset.placeRating,
            lat: addButton.dataset.placeLat,
            lng: addButton.dataset.placeLng,
            photoUrl: addButton.dataset.placePhotoUrl
        };
        addModal.style.display = 'flex';
    } else if (editButton) {
        document.getElementById('edit-day-id').value = editButton.dataset.dayId;
        document.getElementById('edit-place-id').value = editButton.dataset.placeId;
        document.getElementById('edit-place-time').value = editButton.dataset.time;
        document.getElementById('edit-place-cost').value = editButton.dataset.cost;
        editModal.style.display = 'flex';
    } else if (deleteButton) {
        placeToDelete = {
            placeId: deleteButton.dataset.placeId,
            dayId: deleteButton.dataset.dayId
        };
        confirmModal.style.display = 'flex';
    }
    else if (addPlaceToDayBtn) {
        // --- THIS IS THE NEW LOGIC ---
        // 1. Get the dayId from the button that was clicked
        const dayId = addPlaceToDayBtn.dataset.dayId;

        // 2. Find the 'Add to which day?' dropdown in the modal
        const daySelectDropdown = document.getElementById('day-select');
        if (daySelectDropdown) {
            // 3. Pre-select that day for the user
            daySelectDropdown.value = dayId;
        }
        
        // 4. Find the 'Overview' sidebar button and click it to switch tabs
        const overviewSidebarLink = document.querySelector('.sidebar-link[data-view="overview"]');
        if (overviewSidebarLink) {
            overviewSidebarLink.click();
        }
    }
});

// --- MODAL HANDLERS ---

// Add Place Modal
if (addPlaceForm && closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        addModal.style.display = 'none';
    });

    addPlaceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dayId = document.getElementById('day-select').value;
        const scheduledTime = document.getElementById('place-time').value;
        const cost = document.getElementById('place-cost').value;

        try {
            const response = await fetch('/api/planner/add-place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripId: currentTripId,
                    dayId,
                    placeName: placeToAdd.name,
                    googlePlaceId: placeToAdd.id,
                    address: placeToAdd.address,
                    rating: parseFloat(placeToAdd.rating),
                    lat: parseFloat(placeToAdd.lat),
                    lng: parseFloat(placeToAdd.lng),
                    scheduledTime,
                    cost: parseFloat(cost) || 0,
                    photoUrl: placeToAdd.photoUrl
                })
            });

            if (!response.ok) throw new Error('Server returned an error');
            
            const result = await response.json();
            
            // =========================================================================
            // THIS IS THE FIX: The missing success handling block has been added back.
            // =========================================================================
            if (result.success && result.addedPlace) {
                // On success:
                addModal.style.display = 'none'; // 1. Close the modal
                showFlashMessage("Place added successfully!"); // 2. Show success message

                // 3. Dynamically add the new place card to the Itinerary view
                const dayContainer = document.querySelector(`.day-places[data-day-id="${dayId}"]`);
                if (dayContainer) {
                    const noPlacesMsg = dayContainer.querySelector('.no-places-message');
                    if (noPlacesMsg) noPlacesMsg.remove();
                    
                    const itemCount = dayContainer.querySelectorAll('.place-card-simple').length;
                    const newNumber = itemCount + 1;
                    
                    if (totalCostDisplay && result.addedPlace.cost > 0) {
                // 1. Get the current total from the page, removing currency symbols and commas
                        const currentTotalText = totalCostDisplay.textContent.replace(/[^0-9.-]+/g,"");
                        let currentTotal = parseFloat(currentTotalText) || 0;

                        // 2. Add the new cost
                        const newTotal = currentTotal + (result.addedPlace.cost || 0);

                        // 3. Update the text on the page with the new, formatted total
                        totalCostDisplay.textContent = `₹${newTotal.toLocaleString('en-IN')}`;

                        const expenseList = document.querySelector('.expense-list');
                const dayTitle = document.querySelector(`.day-places[data-day-id="${dayId}"]`).closest('.day-plan').querySelector('h2').textContent;
                if(expenseList) {
                    const expenseItemHTML = `
                        <div class="expense-item" id="expense-${result.addedPlace._id}">
                            <div class="expense-info">
                                <span class="expense-day-title">${dayTitle}</span>
                                <p class="expense-place-name">${result.addedPlace.name}</p>
                            </div>
                            <div class="expense-amount">
                                <p>₹${cost.toLocaleString('en-IN')}</p>
                            </div>
                        </div>`;
                    expenseList.insertAdjacentHTML('beforeend', expenseItemHTML);
                }
                    }
                    const newPlaceCard = `
                        <div class="place-card-simple" id="place-${result.addedPlace._id}" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${result.addedPlace.photoUrl}');">
                            <div class="place-number">${newNumber}</div>
                            <div class="place-details">
                                <p>${result.addedPlace.name}</p>
                                <small>${result.addedPlace.address || ''}</small>
                                <div class="place-meta">
                                    <span class="meta-item" id="time-${result.addedPlace._id}">🕒 ${result.addedPlace.scheduledTime || 'No time'}</span>
                                    <span class="meta-item" id="cost-${result.addedPlace._id}">💰 ₹${result.addedPlace.cost || 0}</span>
                                </div>
                            </div>
                            <div class="place-card-actions">
                                <a href="https://www.google.com/maps?q=${result.addedPlace.lat},${result.addedPlace.lng}" class="btn-map" target="_blank"><span class="material-symbols-outlined">map</span></a>
                                <button class="btn-edit-place" data-place-id="${result.addedPlace._id}" data-day-id="${dayId}" data-time="${result.addedPlace.scheduledTime || ''}" data-cost="${result.addedPlace.cost || 0}"><span class="material-symbols-outlined">edit</span></button>
                                <button class="btn-delete-place" data-place-id="${result.addedPlace._id}" data-day-id="${dayId}"><span class="material-symbols-outlined">delete</span></button>
                            </div>
                        </div>`;
                    dayContainer.insertAdjacentHTML('beforeend', newPlaceCard);
                }
            } else {
                showFlashMessage(result.message || 'An error occurred.', 'error');
            }
        } catch (err) {
            console.error("Add Place Error:", err);
            showFlashMessage("A client-side error occurred. Check console.", 'error');
        }
    });
}



// Edit Place Modal
if (editPlaceForm && closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editPlaceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dayId = document.getElementById('edit-day-id').value;
    const placeId = document.getElementById('edit-place-id').value;
    const newTime = document.getElementById('edit-place-time').value;
    const newCost = document.getElementById('edit-place-cost').value;

    try {
        const response = await fetch('/api/planner/update-place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dayId,
                placeId,
                scheduledTime: newTime,
                cost: parseFloat(newCost) || 0
            })
        });

        if (!response.ok) { throw new Error('Server error on update'); }
        const result = await response.json();

        // --- THIS IS THE FIX ---
        if (result.success && result.updatedPlace) {
            sessionStorage.setItem('flashMessage', 'Place updated successfully!');
            // 1. Close the modal
    window.location.hash = 'itinerary';
    // 2. Reload the page to get all the fresh data
    window.location.reload()
        } else {
            showFlashMessage(result.message || 'An error occurred.', 'error');
        }
    } catch (err) {
        showFlashMessage("A client-side error occurred.", 'error');
    }
});

}

// Delete Confirmation Modal
if (confirmDeleteBtn && cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        try {
        const response = await fetch('/api/planner/delete-place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                dayId: placeToDelete.dayId, 
                placeId: placeToDelete.placeId 
            })
        });

        if (!response.ok) { throw new Error('Server error'); }
        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('flashMessage', 'Place deleted successfully!');
            window.location.hash = 'itinerary';
            // --- THIS IS THE FIX ---
            // 1. Find the element to be removed
    // 2. Reload the page to get all the fresh data
        window.location.reload();
            // --- END OF FIX ---

        } else {
            showFlashMessage(result.message || 'Error deleting place.', 'error');
        }
    } catch (err) {
        showFlashMessage("A client-side error occurred.", 'error');
    } finally {
        // This part is the same: hide the modal and clear the state
        confirmModal.style.display = 'none';
        placeToDelete = {};
    }
    });
}

// Initial Page Load Handler
// This is at the bottom of your public/js/planner.js file

// This is the complete and final version of the page load handler

document.addEventListener('DOMContentLoaded', () => {
    // This part handles the main sidebar (Overview, Itinerary, Budget)

    const flashMessage = sessionStorage.getItem('flashMessage');
    if (flashMessage) {
        showFlashMessage(flashMessage); // Display the message
        sessionStorage.removeItem('flashMessage'); // Clear it so it doesn't show again
    }
    const hash = window.location.hash;
    let initialView = 'overview'; // Default to 'overview'

    if (hash) {
        const viewFromHash = hash.substring(1); // Remove the '#'
        if (document.querySelector(`.sidebar-link[data-view="${viewFromHash}"]`)) {
            initialView = viewFromHash;
        }
    }

    const initialButton = document.querySelector(`.sidebar-link[data-view="${initialView}"]`);
    if (initialButton) {
        initialButton.click();
    }

    // =========================================================================
    // --- THIS IS THE FIX ---
    // It finds the default sub-tab within the Overview page ("Explore") 
    // and programmatically clicks it to ensure it's always active on load.
    // =========================================================================
    const initialSubTab = document.querySelector('.overview-sub-nav .sub-tab-btn');
    if (initialSubTab) {
        initialSubTab.click();
    }
});
// --- NEW: EVENT LISTENER FOR THE SHARE FEATURE ---

if (sharePlanBtn) {
    sharePlanBtn.addEventListener('click', async () => {
        // Reset the modal's state every time it's opened
        shareUrlInput.value = 'Generating link...';
        copyLinkBtn.textContent = 'Copy Link';
        shareModal.style.display = 'flex';

        try {
            // Call the backend API route you created
            const response = await fetch(`/api/trip/${currentTripId}/share`, { method: 'POST' });
            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();

            // Display the URL returned by the server
            if (data.success) {
                shareUrlInput.value = data.shareUrl;
            } else {
                shareUrlInput.value = 'Could not generate link.';
            }
        } catch (err) {
            shareUrlInput.value = 'Error generating link.';
        }
    });
}

// You will also need the listeners for closing the modal and copying the link
if (closeShareModalBtn) {
    closeShareModalBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });
}
if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        shareUrlInput.select();
        try {
            document.execCommand('copy');
            copyLinkBtn.textContent = 'Copied!';
            showFlashMessage('Link copied to clipboard!');
        } catch (err) {
            copyLinkBtn.textContent = 'Failed!';
            showFlashMessage('Failed to copy link.', 'error');
        }
        
        setTimeout(() => {
            copyLinkBtn.textContent = 'Copy Link';
        }, 2000);
    });
}