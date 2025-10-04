// public/js/planner/navigationHandlers.js

import { DOM } from './domElements.js';
import { state, setState } from './state.js';
import { renderSearchResults } from './utils.js';

/**
 * Initialize sidebar navigation
 */
export function initSidebarNavigation() {
    if (!DOM.sidebarLinks.length) return;
    
    DOM.sidebarLinks.forEach(link => {
        link.addEventListener('click', () => handleSidebarClick(link));
    });
}

/**
 * Handle sidebar link clicks
 */
function handleSidebarClick(link) {
    const targetView = link.dataset.view;
    
    // Update active states
    DOM.sidebarLinks.forEach(l => l.classList.remove('active'));
    DOM.plannerViews.forEach(v => v.classList.remove('active'));
    if (DOM.overviewControls) DOM.overviewControls.classList.remove('active');
    
    link.classList.add('active');
    document.getElementById(targetView + '-view').classList.add('active');
    
    // Update header and handle view-specific logic
    if (targetView === "overview") {
        handleOverviewView();
    } else if (targetView === "itinerary") {
        DOM.plannerHeader.textContent = "Your Itinerary";
    } else if (targetView === "budget") {
        DOM.plannerHeader.textContent = "Budget Tracker";
    }
}

/**
 * Handle overview view activation
 */
function handleOverviewView() {
    DOM.plannerHeader.textContent = "Overview & Notes";
    if (DOM.overviewControls) DOM.overviewControls.classList.add('active');

    // Perform initial search or restore results
    if (state.lastSearchResults.length === 0 && !state.isInitialSearchPerformed) {
        const restaurantButton = document.querySelector('.category-btn[data-query="restaurants"]');
        if (restaurantButton) {
            restaurantButton.click();
        }
        setState('isInitialSearchPerformed', true);
    } else if (state.lastSearchResults.length > 0) {
        renderSearchResults(state.lastSearchResults, false);
    }
}

/**
 * Initialize overview sub-navigation
 */
export function initOverviewSubNavigation() {
    if (!DOM.overviewSubNav) return;
    
    DOM.overviewSubNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('sub-tab-btn')) {
            document.querySelectorAll('.sub-tab-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            document.querySelectorAll('.overview-sub-view').forEach(view => 
                view.classList.remove('active')
            );
            
            const subviewId = e.target.dataset.subview;
            e.target.classList.add('active');
            document.getElementById(subviewId).classList.add('active');
        }
    });
}

/**
 * Initialize page on load
 */
export function initPageLoad() {
    // Handle flash messages from session storage
    const flashMessage = sessionStorage.getItem('flashMessage');
    if (flashMessage) {
        const { showFlashMessage } = require('./utils.js');
        showFlashMessage(flashMessage);
        sessionStorage.removeItem('flashMessage');
    }

    // Determine initial view from URL hash
    const hash = window.location.hash;
    let initialView = 'overview';

    if (hash) {
        const viewFromHash = hash.substring(1);
        if (document.querySelector(`.sidebar-link[data-view="${viewFromHash}"]`)) {
            initialView = viewFromHash;
        }
    }

    // Click the initial view button
    const initialButton = document.querySelector(`.sidebar-link[data-view="${initialView}"]`);
    if (initialButton) {
        initialButton.click();
    }

    // Activate default sub-tab in Overview
    const initialSubTab = document.querySelector('.overview-sub-nav .sub-tab-btn');
    if (initialSubTab) {
        initialSubTab.click();
    }
}