// public/js/planner/main.js

import { DOM } from './domElements.js';
import { initSidebarNavigation, initOverviewSubNavigation, initPageLoad } from './navigationHandlers.js';
import { performSearch, handleCategoryClick, handleSearchInput, handleLoadMore } from './searchService.js';
import { initModals } from './modalHandlers.js';
import { initShareHandlers } from './shareHandlers.js';

/**
 * Initialize all event listeners and handlers
 */
function init() {
    // Navigation
    initSidebarNavigation();
    initOverviewSubNavigation();
    
    // Category buttons
    initCategoryButtons();
    
    // Search functionality
    initSearchHandlers();
    
    // Modals
    initModals();
    
    // Share functionality
    initShareHandlers();
}

/**
 * Initialize category button handlers
 */
function initCategoryButtons() {
    if (!DOM.categoryGrid) return;
    
    DOM.categoryGrid.addEventListener('click', (e) => {
        const categoryButton = e.target.closest('.category-btn');
        if (categoryButton) {
            const query = categoryButton.dataset.query;
            categoryButton.classList.add('selected');
            handleCategoryClick(query);
        }
    });
}

/**
 * Initialize search handlers
 */
function initSearchHandlers() {
    // Search button
    if (DOM.searchButton && DOM.searchInput) {
        DOM.searchButton.addEventListener('click', () => {
            const query = DOM.searchInput.value.trim();
            if (query) {
                handleSearchInput(query);
            }
        });
        
        // Allow Enter key to trigger search
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = DOM.searchInput.value.trim();
                if (query) {
                    handleSearchInput(query);
                }
            }
        });
    }
    
    // Load more button
    if (DOM.loadMoreBtn) {
        DOM.loadMoreBtn.addEventListener('click', handleLoadMore);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();
    initPageLoad();
});