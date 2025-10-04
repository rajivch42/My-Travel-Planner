// public/js/planner/modalHandlers.js

import { DOM } from './domElements.js';
import { setPlaceToAdd, setPlaceToDelete } from './state.js';
import { handleAddPlace, handleEditPlace, handleDeletePlace, handleSaveNotes } from './placeHandlers.js';

/**
 * Initialize all modal event listeners
 */
export function initModals() {
    initAddPlaceModal();
    initEditPlaceModal();
    initConfirmDeleteModal();
    initGlobalClickHandlers();
    initNotesHandler();
}

/**
 * Initialize add place modal
 */
function initAddPlaceModal() {
    if (!DOM.addPlaceForm || !DOM.closeModalBtn) return;
    
    DOM.closeModalBtn.addEventListener('click', () => {
        DOM.addModal.style.display = 'none';
    });

    DOM.addPlaceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            dayId: document.getElementById('day-select').value,
            scheduledTime: document.getElementById('place-time').value,
            cost: document.getElementById('place-cost').value
        };
        
        await handleAddPlace(formData);
    });
}

/**
 * Initialize edit place modal
 */
function initEditPlaceModal() {
    if (!DOM.editPlaceForm || !DOM.closeEditModalBtn) return;
    
    DOM.closeEditModalBtn.addEventListener('click', () => {
        DOM.editModal.style.display = 'none';
    });

    DOM.editPlaceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            dayId: document.getElementById('edit-day-id').value,
            placeId: document.getElementById('edit-place-id').value,
            scheduledTime: document.getElementById('edit-place-time').value,
            cost: document.getElementById('edit-place-cost').value
        };
        
        await handleEditPlace(formData);
    });
}

/**
 * Initialize confirm delete modal
 */
function initConfirmDeleteModal() {
    if (!DOM.confirmDeleteBtn || !DOM.cancelDeleteBtn) return;
    
    DOM.cancelDeleteBtn.addEventListener('click', () => {
        DOM.confirmModal.style.display = 'none';
    });

    DOM.confirmDeleteBtn.addEventListener('click', async () => {
        await handleDeletePlace();
    });
}

/**
 * Initialize global click handlers for dynamic buttons
 */
function initGlobalClickHandlers() {
    document.addEventListener('click', (e) => {
        const addButton = e.target.closest('.add-place-btn');
        const editButton = e.target.closest('.btn-edit-place');
        const deleteButton = e.target.closest('.btn-delete-place');
        const addPlaceToDayBtn = e.target.closest('.btn-add-place-to-day');

        if (addButton) {
            handleAddButtonClick(addButton);
        } else if (editButton) {
            handleEditButtonClick(editButton);
        } else if (deleteButton) {
            handleDeleteButtonClick(deleteButton);
        } else if (addPlaceToDayBtn) {
            handleAddPlaceToDayClick(addPlaceToDayBtn);
        }
    });
}

/**
 * Handle add button click
 */
function handleAddButtonClick(button) {
    const placeData = {
        name: button.dataset.placeName,
        id: button.dataset.placeId,
        address: button.dataset.placeAddress,
        rating: button.dataset.placeRating,
        lat: button.dataset.placeLat,
        lng: button.dataset.placeLng,
        photoUrl: button.dataset.placePhotoUrl
    };
    
    setPlaceToAdd(placeData);
    DOM.addModal.style.display = 'flex';
}

/**
 * Handle edit button click
 */
function handleEditButtonClick(button) {
    document.getElementById('edit-day-id').value = button.dataset.dayId;
    document.getElementById('edit-place-id').value = button.dataset.placeId;
    document.getElementById('edit-place-time').value = button.dataset.time;
    document.getElementById('edit-place-cost').value = button.dataset.cost;
    DOM.editModal.style.display = 'flex';
}

/**
 * Handle delete button click
 */
function handleDeleteButtonClick(button) {
    const placeData = {
        placeId: button.dataset.placeId,
        dayId: button.dataset.dayId
    };
    
    setPlaceToDelete(placeData);
    DOM.confirmModal.style.display = 'flex';
}

/**
 * Handle add place to specific day button click
 */
function handleAddPlaceToDayClick(button) {
    const dayId = button.dataset.dayId;
    
    // Pre-select the day in the dropdown
    const daySelectDropdown = document.getElementById('day-select');
    if (daySelectDropdown) {
        daySelectDropdown.value = dayId;
    }
    
    // Switch to overview tab
    const overviewSidebarLink = document.querySelector('.sidebar-link[data-view="overview"]');
    if (overviewSidebarLink) {
        overviewSidebarLink.click();
    }
}

/**
 * Initialize notes save handler
 */
function initNotesHandler() {
    if (!DOM.saveNotesBtn || !DOM.notesTextarea) return;
    
    DOM.saveNotesBtn.addEventListener('click', async () => {
        const notesContent = DOM.notesTextarea.value;
        await handleSaveNotes(notesContent);
    });
}