// public/js/planner/state.js

// Global state management
export const state = {
    placeToAdd: {},
    placeToDelete: {},
    currentQuery: '',
    nextPageToken: null,
    isLoading: false,
    lastSearchResults: [],
    isInitialSearchPerformed: false
};

// State management functions
export const setState = (key, value) => {
    state[key] = value;
};

export const getState = (key) => {
    return state[key];
};

export const resetPlaceToAdd = () => {
    state.placeToAdd = {};
};

export const resetPlaceToDelete = () => {
    state.placeToDelete = {};
};

export const setPlaceToAdd = (placeData) => {
    state.placeToAdd = placeData;
};

export const setPlaceToDelete = (placeData) => {
    state.placeToDelete = placeData;
};