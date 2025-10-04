// public/js/planner/config.js

export const CONFIG = {
    FLASH_MESSAGE_DURATION: 3000,
    API_ENDPOINTS: {
        SEARCH: '/api/places/search',
        NOTES: '/api/trip/:tripId/notes',
        ADD_PLACE: '/api/planner/add-place',
        UPDATE_PLACE: '/api/planner/update-place',
        DELETE_PLACE: '/api/planner/delete-place',
        SHARE: '/api/trip/:tripId/share'
    }
};