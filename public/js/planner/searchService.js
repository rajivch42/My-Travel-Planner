// public/js/planner/searchService.js

import { DOM, getCurrentTripId } from './domElements.js';
import { state, setState } from './state.js';
import { renderSearchResults } from './utils.js';

/**
 * Perform a search for places
 */
export async function performSearch(query, pageToken) {
    const currentTripId = getCurrentTripId();
    
    if (state.isLoading || !currentTripId) return;
    
    setState('isLoading', true);
    
    if (pageToken) {
        DOM.loadMoreBtn.textContent = 'Loading...';
    } else {
        DOM.resultsContainer.innerHTML = '<p>Searching...</p>';
        setState('currentQuery', query);
    }
    
    let url = `/api/places/search?tripId=${currentTripId}`;
    url += pageToken ? `&pagetoken=${pageToken}` : `&query=${query}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        renderSearchResults(data.results, !!pageToken);
        
        setState('nextPageToken', data.nextPageToken);
        DOM.loadMoreContainer.style.display = data.nextPageToken ? 'block' : 'none';
        
        const updatedResults = pageToken 
            ? state.lastSearchResults.concat(data.results) 
            : data.results;
        setState('lastSearchResults', updatedResults);
        
    } catch (err) {
        DOM.resultsContainer.innerHTML = '<p style="color: red;">Error: Could not find places.</p>';
    } finally {
        setState('isLoading', false);
        DOM.loadMoreBtn.textContent = 'Load More';
    }
}

/**
 * Handle category button clicks
 */
export function handleCategoryClick(categoryQuery) {
    sessionStorage.setItem('lastPlannerCategory', categoryQuery);
    DOM.categoryGrid.querySelectorAll('.category-btn').forEach(btn => 
        btn.classList.remove('selected')
    );
    performSearch(categoryQuery, null);
}

/**
 * Handle search input
 */
export function handleSearchInput(query) {
    if (!query) return;
    
    document.querySelectorAll('.category-btn').forEach(btn => 
        btn.classList.remove('selected')
    );
    performSearch(query, null);
}

/**
 * Handle load more button
 */
export function handleLoadMore() {
    if (state.nextPageToken) {
        performSearch(null, state.nextPageToken);
    }
}