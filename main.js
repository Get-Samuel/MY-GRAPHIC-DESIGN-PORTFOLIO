/**
 * MAIN.JS - Portfolio Website JavaScript
 * 
 * This file contains all the interactive functionality for the portfolio:
 * - Gallery generation from flyer images array
 * - Modal/preview functionality for flyer images
 * - Keyboard navigation and accessibility features
 * - Focus management for modal
 */

// ============================================================================
// GALLERY DATA
// ============================================================================

/**
 * Array of flyer image paths
 * TODO: Replace these placeholder paths with your actual filenames from Public/ALL FLYERS folder
 * 
 * Current folder structure: Public/ALL FLYERS/
 * Make sure the paths match your actual file names exactly (case-sensitive)
 */
const flyers = [
    '/Public/ALL FLYERS/AFROSONIK-FEST-\'25-FLYER.png',
    '/Public/ALL FLYERS/AFTER-PARTY-01-POSTER.png',
    '/Public/ALL FLYERS/AISHA\'S-BEAUTY-EMPIRE-02.png',
    '/Public/ALL FLYERS/BEYOND-THE-CANVAS-ART-EXHIBITION.png',
    '/Public/ALL FLYERS/BORN-FROM-THE-STREETS-POSTER.png',
    '/Public/ALL FLYERS/BUSINESS-MADE-EASY.png',
    '/Public/ALL FLYERS/CHARITY-01-FULL.png',
    '/Public/ALL FLYERS/CLOUDY-POSTER-01.png',
    '/Public/ALL FLYERS/CRYPTO-02.png',
    '/Public/ALL FLYERS/CRYPTO-FLYER.png',
    '/Public/ALL FLYERS/CRYPTO-INSTANTLY.png',
    '/Public/ALL FLYERS/FILL-UP-PRAYER-POSTER.png',
    '/Public/ALL FLYERS/FOREX-EXCHANGE01.png',
    '/Public/ALL FLYERS/FORTI-CRYPTO-POSTER-01.png',
    '/Public/ALL FLYERS/FORTI-TRADE-POSTER-04.png',
    '/Public/ALL FLYERS/FORTI-TRADIND-POSTER-05-01.png',
    '/Public/ALL FLYERS/FORTI-TRADING-POSTER-02.png',
    '/Public/ALL FLYERS/GAMBRO-BDAY-FLYER.png',
    '/Public/ALL FLYERS/JASSEH\'S-POSTER-01.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-01.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-02.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-03.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-04.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-05.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-06.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-07.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-08.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-09.png',
    '/Public/ALL FLYERS/KADDI-KONNECT-POSTER-GRID.png',
    '/Public/ALL FLYERS/MICRO-FINANCE-01-A.png',
    '/Public/ALL FLYERS/MICRO-FINANCE-01.png',
    '/Public/ALL FLYERS/PREDICT-THE-WIN.png',
    '/Public/ALL FLYERS/PTC-TRADING-POSTER-02.png',
    '/Public/ALL FLYERS/SIGNAL-ART-EXHIBITION.png',
    '/Public/ALL FLYERS/SOHNA-SPIRITS-POSTER-01.gif',
    '/Public/ALL FLYERS/THANK-GOD-IS-FRIDAY.png',
    '/Public/ALL FLYERS/TINNA\'S-MASTERCLASS-MAKEUP-3D-HEART.png',
    '/Public/ALL FLYERS/TIRED-OF-DELAYED-TRANSACTION-02.png'
];

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

/**
 * Get references to key DOM elements
 * These will be used throughout the script for gallery and modal functionality
 */
const galleryContainer = document.getElementById('gallery-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalImage = document.getElementById('modal-image');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');

// Store reference to the element that opened the modal (for focus management)
let lastFocusedElement = null;

// ============================================================================
// GALLERY GENERATION
// ============================================================================

/**
 * Generates the gallery of flyer images
 * Creates clickable card elements for each flyer in the array
 * Each card displays a thumbnail and opens the modal on click
 */
function generateGallery() {
    // Check if gallery container exists
    if (!galleryContainer) {
        console.error('Gallery container not found!');
        return;
    }
    
    // Clear any existing content (in case function is called multiple times)
    galleryContainer.innerHTML = '';
    
    // Loop through each flyer in the array
    flyers.forEach((flyerPath, index) => {
        // Extract filename from path for alt text and aria-label
        // Example: '/Public/ALL FLYERS/FLYER-NAME.png' -> 'FLYER-NAME'
        const filename = flyerPath.split('/').pop().replace(/\.[^/.]+$/, '');
        
        // Create a card container for each flyer
        // This div will be clickable and contain the image
        const card = document.createElement('div');
        card.className = 'cursor-pointer group overflow-hidden rounded-lg bg-gray-900 hover:bg-gray-800 transition-all duration-300';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0'); // Make keyboard accessible
        card.setAttribute('aria-label', `View ${filename} flyer`);
        
        // Create the image element
        const img = document.createElement('img');
        img.src = flyerPath;
        img.alt = `${filename} flyer preview`;
        img.className = 'w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300';
        img.loading = 'lazy'; // Lazy load images for better performance
        
        // Append image to card
        card.appendChild(img);
        
        // Add click event listener to open modal
        card.addEventListener('click', () => openModal(flyerPath, filename));
        
        // Add keyboard event listener (Enter or Space key)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent default scroll behavior on Space
                openModal(flyerPath, filename);
            }
        });
        
        // Append card to gallery container
        galleryContainer.appendChild(card);
    });
}

// ============================================================================
// MODAL FUNCTIONALITY
// ============================================================================

/**
 * Opens the modal/preview overlay with the selected flyer image
 * 
 * @param {string} imagePath - Path to the flyer image to display
 * @param {string} imageName - Name of the flyer (for download filename)
 */
function openModal(imagePath, imageName) {
    // Store the currently focused element (the card that was clicked)
    // This allows us to return focus to it when modal closes
    lastFocusedElement = document.activeElement;
    
    // Set the modal image source to the clicked flyer
    modalImage.src = imagePath;
    modalImage.alt = `${imageName} flyer full preview`;
    
    // Set the download button href and download attribute
    // This allows users to download the flyer directly from the modal
    modalDownloadBtn.href = imagePath;
    modalDownloadBtn.download = imageName;
    
    // Show the modal overlay (remove 'hidden' class, add 'flex' for centering)
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');
    
    // Prevent body scroll when modal is open (so background doesn't scroll)
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for keyboard accessibility
    // This traps focus inside the modal
    modalCloseBtn.focus();
}

/**
 * Closes the modal/preview overlay
 * Restores focus to the element that opened it
 */
function closeModal() {
    // Hide the modal overlay (add 'hidden' class, remove 'flex')
    modalOverlay.classList.add('hidden');
    modalOverlay.classList.remove('flex');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to the element that opened the modal
    // This is important for keyboard navigation and screen readers
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Set up all event listeners for modal interactions
 * Includes: close button, Escape key, and clicking outside the image
 */
function setupEventListeners() {
    // Close button click event
    // When user clicks the "Close" button in top-right corner
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Escape key event listener
    // Closes modal when user presses Escape key
    document.addEventListener('keydown', (e) => {
        // Check if Escape key was pressed AND modal is currently visible
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Click outside image to close modal
    // When user clicks on the dark overlay background (not on the image itself)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Check if the click target is the overlay itself (not a child element)
            // This means user clicked on the dark background, not on the image or buttons
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the portfolio functionality
 * Called when the DOM is fully loaded
 * Generates the gallery and sets up event listeners
 */
function init() {
    // Generate the gallery of flyer images
    generateGallery();
    
    // Set up all event listeners for modal interactions
    setupEventListeners();
    
    // Log success message to console (for debugging)
    console.log('Portfolio initialized successfully!');
    console.log(`Loaded ${flyers.length} flyer images.`);
}

// ============================================================================
// RUN INITIALIZATION
// ============================================================================

/**
 * Wait for DOM to be fully loaded before initializing
 * This ensures all HTML elements exist before JavaScript tries to access them
 */
if (document.readyState === 'loading') {
    // DOM is still loading, wait for 'DOMContentLoaded' event
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded, initialize immediately
    init();
}

