// public/js/planner/shareHandlers.js

import { DOM, getCurrentTripId } from './domElements.js';
import { showFlashMessage } from './utils.js';

/**
 * Initialize share functionality
 */
export function initShareHandlers() {
    if (!DOM.sharePlanBtn) return;
    
    DOM.sharePlanBtn.addEventListener('click', handleShareClick);
    
    if (DOM.closeShareModalBtn) {
        DOM.closeShareModalBtn.addEventListener('click', () => {
            DOM.shareModal.style.display = 'none';
        });
    }
    
    if (DOM.copyLinkBtn) {
        DOM.copyLinkBtn.addEventListener('click', handleCopyLink);
    }
}

/**
 * Handle share button click
 */
async function handleShareClick() {
    const currentTripId = getCurrentTripId();
    
    // Reset modal state
    DOM.shareUrlInput.value = 'Generating link...';
    DOM.copyLinkBtn.textContent = 'Copy Link';
    DOM.shareModal.style.display = 'flex';

    try {
        const response = await fetch(`/api/trip/${currentTripId}/share`, { 
            method: 'POST' 
        });
        
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();

        if (data.success) {
            DOM.shareUrlInput.value = data.shareUrl;
        } else {
            DOM.shareUrlInput.value = 'Could not generate link.';
        }
    } catch (err) {
        DOM.shareUrlInput.value = 'Error generating link.';
    }
}

/**
 * Handle copy link button click
 */
function handleCopyLink() {
    DOM.shareUrlInput.select();
    
    try {
        document.execCommand('copy');
        DOM.copyLinkBtn.textContent = 'Copied!';
        showFlashMessage('Link copied to clipboard!');
    } catch (err) {
        DOM.copyLinkBtn.textContent = 'Failed!';
        showFlashMessage('Failed to copy link.', 'error');
    }
    
    setTimeout(() => {
        DOM.copyLinkBtn.textContent = 'Copy Link';
    }, 2000);
}