document.addEventListener('DOMContentLoaded', () => {
    setupCopyButtons();
    setupActivitiesGallery();
    setupBackgroundSlideshow();
});

/**
 * Configures copy-to-clipboard buttons for lecturer phone numbers
 */
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');

    copyButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const phoneNumber = button.getAttribute('data-phone');
            
            if (!phoneNumber) return;

            try {
                // Copy to clipboard
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(phoneNumber);
                } else {
                    // Fallback for older or non-secure contexts
                    const textArea = document.createElement('textarea');
                    textArea.value = phoneNumber;
                    textArea.style.position = 'fixed'; // Avoid scrolling to bottom
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }

                // Visual feedback on the button
                const originalContent = button.innerHTML;
                button.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                `;
                button.style.borderColor = 'var(--accent)';
                button.style.color = 'var(--primary)';
                button.style.backgroundColor = 'rgba(10, 160, 230, 0.08)';

                // Show toast notification
                toast.textContent = `Copied ${phoneNumber} to clipboard!`;
                toast.classList.add('show');

                // Reset button and toast after delay
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    button.style.borderColor = '';
                    button.style.color = '';
                    button.style.backgroundColor = '';
                }, 2000);

                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2500);

            } catch (err) {
                console.error('Failed to copy text: ', err);
                // Fallback direct display alert in worst case scenario
                alert(`Phone number: ${phoneNumber}`);
            }
        });
    });
}

/**
 * Configures the faculty activities gallery toggle and lightbox modal
 */
function setupActivitiesGallery() {
    const toggleBtn = document.getElementById('toggle-gallery-btn');
    const hideableCards = document.querySelectorAll('.activity-card.hideable');
    const cards = document.querySelectorAll('.activity-card');
    
    // Gallery Expand/Collapse Toggle
    if (toggleBtn && hideableCards.length > 0) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.classList.contains('expanded');
            
            hideableCards.forEach((card, index) => {
                if (isExpanded) {
                    card.classList.add('hidden');
                    card.classList.remove('fade-in');
                } else {
                    card.classList.remove('hidden');
                    // Stagger the fade-in animation for a premium micro-animation feel!
                    card.style.animationDelay = `${index * 0.06}s`;
                    card.classList.add('fade-in');
                }
            });
            
            if (isExpanded) {
                toggleBtn.classList.remove('expanded');
                toggleBtn.querySelector('span').textContent = 'View All Activities';
            } else {
                toggleBtn.classList.add('expanded');
                toggleBtn.querySelector('span').textContent = 'Show Less';
            }
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    let currentIndex = 0;
    
    // Get all image sources
    const galleryItems = Array.from(cards).map(card => card.getAttribute('data-src'));

    function showImage(index) {
        if (index < 0) {
            index = galleryItems.length - 1;
        } else if (index >= galleryItems.length) {
            index = 0;
        }
        currentIndex = index;
        
        // Update lightbox elements
        lightboxImg.src = galleryItems[currentIndex];
    }

    function openLightbox(index) {
        showImage(index);
        lightbox.style.display = 'flex';
        // Allow rendering display before adding active show class to trigger CSS transition opacity!
        setTimeout(() => {
            lightbox.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden'; // Disable scroll on body
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        // Wait for CSS transition opacity to complete before setting display none
        setTimeout(() => {
            lightbox.style.display = 'none';
        }, 350);
        document.body.style.overflow = ''; // Enable scroll on body
    }

    // Add click listeners to cards
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.getAttribute('data-index'), 10);
            openLightbox(index);
        });
    });

    // Close on click close button
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
    }

    // Close on click outside lightbox content (on backdrop)
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Navigate prev / next
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
        });
    }

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showImage(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showImage(currentIndex + 1);
        }
    });

    // Swipe support for mobile screens
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const threshold = 50; // swipe distance threshold in px
        if (touchEndX < touchStartX - threshold) {
            // Swiped Left -> Show next image
            showImage(currentIndex + 1);
        } else if (touchEndX > touchStartX + threshold) {
            // Swiped Right -> Show prev image
            showImage(currentIndex - 1);
        }
    }
}

/**
 * Creates a rotating background slideshow of the 8 faculty activities
 */
function setupBackgroundSlideshow() {
    const photos = [
        "faculty photo activities/2 AI & Robot LAB.jpg",
        "faculty photo activities/2 IoT.jpg",
        "faculty photo activities/4 RMC Program.jpg",
        "faculty photo activities/សកម្មភាពតាំងពិព័រណ៌.jpg",
        "faculty photo activities/3 photo_2024-08-01_20-56-02.jpg",
        "faculty photo activities/1642751760236.jpg",
        "faculty photo activities/1643339462855.jpg",
        "faculty photo activities/Group Photos Lecture.JPG"
    ];
    
    const slide1 = document.getElementById('bg-slide-1');
    const slide2 = document.getElementById('bg-slide-2');
    
    if (!slide1 || !slide2) return;
    
    let currentIndex = 0;
    let activeSlide = slide1;
    let nextSlide = slide2;
    
    // Initialize first slide
    activeSlide.style.backgroundImage = `url('${photos[currentIndex]}')`;
    activeSlide.classList.add('active');
    
    // Rotate every 6 seconds (with 1.5s crossfade)
    setInterval(() => {
        currentIndex = (currentIndex + 1) % photos.length;
        
        // Load next image
        nextSlide.style.backgroundImage = `url('${photos[currentIndex]}')`;
        
        // Swap active state to trigger crossfade
        nextSlide.classList.add('active');
        activeSlide.classList.remove('active');
        
        // Toggle slide elements
        const temp = activeSlide;
        activeSlide = nextSlide;
        nextSlide = temp;
    }, 6000);
}

