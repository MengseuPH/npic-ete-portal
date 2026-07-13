document.addEventListener('DOMContentLoaded', () => {
    setupCopyButtons();
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
