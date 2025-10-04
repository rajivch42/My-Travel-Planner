// public/js/planner/domElements.js

// Export all DOM element references
export const DOM = {
    // Core elements
    sidebarLinks: document.querySelectorAll('.sidebar-link'),
    plannerViews: document.querySelectorAll('.planner-view'),
    plannerHeader: document.getElementById('planner-header'),
    plannerWrapper: document.querySelector('.planner-wrapper'),
    
    // Overview Tab Elements
    categoryGrid: document.querySelector('.category-grid'),
    searchInput: document.getElementById('place-search-input'),
    searchButton: document.getElementById('place-search-button'),
    saveNotesBtn: document.getElementById('save-notes-btn'),
    notesTextarea: document.getElementById('trip-notes-textarea'),
    overviewControls: document.getElementById('overview-controls'),
    resultsContainer: document.getElementById('search-results-container'),
    loadMoreContainer: document.getElementById('load-more-container'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    overviewSubNav: document.querySelector('.overview-sub-nav'),
    
    // Flash Messages
    flashContainer: document.getElementById('flash-message-container'),
    
    // Buttons
    sharePlanBtn: document.getElementById('share-plan-btn'),
    
    // Cost Display
    totalCostDisplay: document.querySelector('.total-cost-display'),
    
    // Modals
    addModal: document.getElementById('add-place-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    addPlaceForm: document.getElementById('add-place-form'),
    
    editModal: document.getElementById('edit-place-modal'),
    closeEditModalBtn: document.getElementById('close-edit-modal-btn'),
    editPlaceForm: document.getElementById('edit-place-form'),
    
    confirmModal: document.getElementById('confirm-modal'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
    
    shareModal: document.getElementById('share-modal'),
    closeShareModalBtn: document.getElementById('close-share-modal-btn'),
    shareUrlInput: document.getElementById('share-url-input'),
    copyLinkBtn: document.getElementById('copy-link-btn')
};

// Get current trip ID from data attribute
export const getCurrentTripId = () => {
    return DOM.plannerWrapper ? DOM.plannerWrapper.dataset.tripId : null;
};