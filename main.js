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
 * Safely encodes a relative file path for use in src/href.
 *
 * Why this exists:
 * - GitHub Pages is strict about URL encoding
 * - Many of your filenames contain spaces, apostrophes, and symbols (e.g. "@")
 * - encodeURI() does NOT encode everything (notably it leaves apostrophes)
 *
 * This function encodes each path segment individually so that:
 * - "./Public/ALL LOGOS/Cliick Logo 1@4x.png"
 * becomes
 * - "./Public/ALL%20LOGOS/Cliick%20Logo%201%404x.png"
 *
 * @param {string} path - A relative path like "./Public/ALL LOGOS/file name.png"
 * @returns {string} - Encoded safe path for the browser
 */
function encodePath(path) {
    return path
        .split('/')
        .map((segment) => {
            // Preserve empty segments and the current-directory marker
            if (segment === '' || segment === '.') return segment;
            return encodeURIComponent(segment);
        })
        .join('/');
}

/**
 * Array of flyer image paths
 * Using relative paths for GitHub Pages compatibility
 * 
 * Current folder structure: Public/ALL FLYERS/
 * All paths are relative to index.html location (root of repository)
 * NOTE: Special characters/spaces are handled by encodePath() when setting src/href
 */
const flyers = [
    './Public/ALL FLYERS/AFROSONIK-FEST-\'25-FLYER.png',
    './Public/ALL FLYERS/AFTER-PARTY-01-POSTER.png',
    './Public/ALL FLYERS/AISHA\'S-BEAUTY-EMPIRE-02.png',
    './Public/ALL FLYERS/BEYOND-THE-CANVAS-ART-EXHIBITION.png',
    './Public/ALL FLYERS/BORN-FROM-THE-STREETS-POSTER.png',
    './Public/ALL FLYERS/BUSINESS-MADE-EASY.png',
    './Public/ALL FLYERS/CHARITY-01-FULL.png',
    './Public/ALL FLYERS/CLOUDY-POSTER-01.png',
    './Public/ALL FLYERS/CRYPTO-02.png',
    './Public/ALL FLYERS/CRYPTO-FLYER.png',
    './Public/ALL FLYERS/CRYPTO-INSTANTLY.png',
    './Public/ALL FLYERS/FILL-UP-PRAYER-POSTER.png',
    './Public/ALL FLYERS/FOREX-EXCHANGE01.png',
    './Public/ALL FLYERS/FORTI-CRYPTO-POSTER-01.png',
    './Public/ALL FLYERS/FORTI-TRADE-POSTER-04.png',
    './Public/ALL FLYERS/FORTI-TRADIND-POSTER-05-01.png',
    './Public/ALL FLYERS/FORTI-TRADING-POSTER-02.png',
    './Public/ALL FLYERS/GAMBRO-BDAY-FLYER.png',
    './Public/ALL FLYERS/JASSEH\'S-POSTER-01.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-01.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-02.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-03.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-04.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-05.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-06.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-07.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-08.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-09.png',
    './Public/ALL FLYERS/KADDI-KONNECT-POSTER-GRID.png',
    './Public/ALL FLYERS/MICRO-FINANCE-01-A.png',
    './Public/ALL FLYERS/MICRO-FINANCE-01.png',
    './Public/ALL FLYERS/PREDICT-THE-WIN.png',
    './Public/ALL FLYERS/PTC-TRADING-POSTER-02.png',
    './Public/ALL FLYERS/SIGNAL-ART-EXHIBITION.png',
    './Public/ALL FLYERS/SOHNA-SPIRITS-POSTER-01.gif',
    './Public/ALL FLYERS/THANK-GOD-IS-FRIDAY.png',
    './Public/ALL FLYERS/TINNA\'S-MASTERCLASS-MAKEUP-3D-HEART.png',
    './Public/ALL FLYERS/TIRED-OF-DELAYED-TRANSACTION-02.png'
];

/**
 * Array of logo image paths (from Public/ALL LOGOS)
 * These are rendered in the "Logo Projects" section.
 *
 * NOTE: Paths are kept un-encoded here for readability; encodePath() handles safety.
 */
const logos = [
    './Public/ALL LOGOS/AfroSnz-Behance-01.png',
    './Public/ALL LOGOS/AfroSnz-Behance-03.png',
    './Public/ALL LOGOS/Annoucement 1.png',
    './Public/ALL LOGOS/BOTLAX 01.png',
    './Public/ALL LOGOS/BOTLAX 02.png',
    './Public/ALL LOGOS/Claud-Africa-New-Logo-1.png',
    './Public/ALL LOGOS/Cliick Logo 1@4x.png',
    './Public/ALL LOGOS/Cliick Logo 4@4x.png',
    './Public/ALL LOGOS/LOGO_1 copy.png',
    './Public/ALL LOGOS/LOGO_7.png',
    './Public/ALL LOGOS/MAGENTA BG.png',
    './Public/ALL LOGOS/WHITE BG 02.png',
];

// ============================================================================
// DOM ELEMENT REFERENCES
// ============================================================================

/**
 * Get references to key DOM elements
 * These will be used throughout the script for gallery and modal functionality
 */
const galleryContainer = document.getElementById('gallery-container');
const logoGalleryContainer = document.getElementById('logo-gallery-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalPanel = document.getElementById('modal-panel');
const modalImage = document.getElementById('modal-image');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');

// Store reference to the element that opened the modal (for focus management)
let lastFocusedElement = null;

// Track whether modal is open (used for keyboard handling)
let isModalOpen = false;

// Match the CSS transition duration in index.html (<style>) so we can hide after animation
const MODAL_ANIMATION_MS = 200;

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
        // Example: 'Public/ALL FLYERS/FLYER-NAME.png' -> 'FLYER-NAME'
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
        // Encode path to handle spaces/special characters for GitHub Pages compatibility
        img.src = encodePath(flyerPath);
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

/**
 * Generates the logo gallery (Logo Projects section)
 * - Fully responsive grid
 * - Each logo preserves aspect ratio (object-fit: contain)
 * - Click opens the same modal/lightbox
 */
function generateLogoGallery() {
    // If the section isn't in the HTML for some reason, fail gracefully
    if (!logoGalleryContainer) {
        console.warn('Logo gallery container not found. Did you remove #logo-gallery-container?');
        return;
    }

    // Clear existing content
    logoGalleryContainer.innerHTML = '';

    // Use a DocumentFragment to minimize DOM thrashing (better performance)
    const fragment = document.createDocumentFragment();

    logos.forEach((logoPath) => {
        // Human-friendly name for aria-label and alt text
        const filenameWithExt = logoPath.split('/').pop() || 'logo';
        const filename = filenameWithExt.replace(/\.[^/.]+$/, '');

        // Create a clickable card
        const card = document.createElement('div');
        card.className =
            // Fixed-height container so the grid looks tidy
            'cursor-pointer group rounded-lg bg-gray-900/60 hover:bg-gray-900 transition-colors p-3 ' +
            'flex items-center justify-center h-28 sm:h-32 md:h-36';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View ${filename} logo`);

        // Create the logo image (contain = never stretch/distort)
        const img = document.createElement('img');
        img.src = encodePath(logoPath);
        img.alt = `${filename} logo preview`;
        img.className = 'w-full h-full object-contain';
        img.loading = 'lazy';

        card.appendChild(img);

        // Click opens modal
        card.addEventListener('click', () => openModal(logoPath, filename));

        // Keyboard support (Enter/Space)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(logoPath, filename);
            }
        });

        fragment.appendChild(card);
    });

    logoGalleryContainer.appendChild(fragment);
}

// ============================================================================
// MODAL FUNCTIONALITY
// ============================================================================

/**
 * Returns all focusable elements inside a container.
 * Used for focus trapping inside the modal for accessibility.
 */
function getFocusableElements(container) {
    if (!container) return [];
    const selector =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector)).filter((el) => {
        // Ignore elements that are not actually visible
        return !(el.offsetParent === null);
    });
}

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
    
    // Mark modal as open (used by keyboard handlers)
    isModalOpen = true;

    // Set the modal image source to the clicked image (flyer OR logo)
    // encodePath() safely handles spaces, apostrophes, and other special characters
    modalImage.src = encodePath(imagePath);
    modalImage.alt = `${imageName} preview`;
    
    // Set the download button href and download attribute
    // This allows users to download the image directly from the modal
    modalDownloadBtn.href = encodePath(imagePath);
    // Use the original filename with extension for the download attribute
    modalDownloadBtn.download = imagePath.split('/').pop() || imageName;
    
    // Show the modal overlay (remove 'hidden' class, add 'flex' for centering)
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.add('flex');

    // Accessibility: mark as visible to assistive tech
    modalOverlay.setAttribute('aria-hidden', 'false');

    // Trigger CSS animation on next frame (adds .is-open)
    requestAnimationFrame(() => {
        modalOverlay.classList.add('is-open');
    });
    
    // Prevent body scroll when modal is open (so background doesn't scroll)
    document.body.style.overflow = 'hidden';
    
    // Focus the close button for keyboard accessibility
    modalCloseBtn.focus();
}

/**
 * Closes the modal/preview overlay
 * Restores focus to the element that opened it
 */
function closeModal() {
    // Mark modal as closed (used by keyboard handlers)
    isModalOpen = false;

    // Start close animation
    modalOverlay.classList.remove('is-open');
    
    // After the animation completes, fully hide the overlay
    window.setTimeout(() => {
        modalOverlay.classList.add('hidden');
        modalOverlay.classList.remove('flex');

        // Accessibility: mark as hidden to assistive tech
        modalOverlay.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to the element that opened the modal
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }, MODAL_ANIMATION_MS);
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
    
    // Global keydown listener:
    // - ESC closes the modal
    // - TAB is trapped inside the modal (focus trap)
    document.addEventListener('keydown', (e) => {
        // ESC closes the modal
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
            return;
        }

        // Focus trap (TAB / Shift+TAB)
        if (e.key === 'Tab' && isModalOpen) {
            const focusables = getFocusableElements(modalOverlay);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            // If SHIFT+TAB on first element, jump to last
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }

            // If TAB on last element, jump to first
            if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
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

    // Generate the logo gallery
    generateLogoGallery();
    
    // Set up all event listeners for modal interactions
    setupEventListeners();
    
    // Log success message to console (for debugging)
    console.log('Portfolio initialized successfully!');
    console.log(`Loaded ${flyers.length} flyer images.`);
    console.log(`Loaded ${logos.length} logo images.`);
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

