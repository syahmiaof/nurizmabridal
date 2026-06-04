document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const header = document.getElementById('main-header');
    const fabSemak = document.getElementById('fab-semak');
    const bookingBackdrop = document.getElementById('booking-backdrop');
    const bookingSheet = document.getElementById('booking-sheet');
    const bookingForm = document.getElementById('booking-form');

    // 1. Sticky Header Scroll Effect
    // Transitions header background from transparent to cream on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.remove('bg-transparent');
            header.classList.add('bg-cream/90', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-gold/10');
        } else {
            header.classList.add('bg-transparent');
            header.classList.remove('bg-cream/90', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-gold/10');
        }
    });

    // 2. Bottom Sheet Logic
    const openSheet = () => {
        // Show backdrop
        bookingBackdrop.classList.remove('hidden');
        // Small delay to allow display:block to apply before changing opacity for transition
        requestAnimationFrame(() => {
            bookingBackdrop.classList.remove('opacity-0');
            // Slide up the sheet
            bookingSheet.classList.remove('translate-y-full');
        });
    };

    const closeSheet = () => {
        // Fade out backdrop
        bookingBackdrop.classList.add('opacity-0');
        // Slide down the sheet
        bookingSheet.classList.add('translate-y-full');
        
        // Wait for transitions to finish before hiding completely
        setTimeout(() => {
            bookingBackdrop.classList.add('hidden');
        }, 300);
    };

    // Event Listeners for Sheet
    fabSemak.addEventListener('click', openSheet);
    bookingBackdrop.addEventListener('click', closeSheet);

    // 3. Smart Booking Form & WhatsApp Generator
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            // Prevent page refresh (Strict Rule)
            e.preventDefault();

            // Retrieve Data
            const name = document.getElementById('cust-name').value.trim();
            const date = document.getElementById('cust-date').value;
            const pkg = document.getElementById('cust-package').value;
            const locationMapDetails = document.getElementById('cust-location').value.trim();

            // Format WhatsApp Number (Using a placeholder number for MVP)
            const adminPhone = '60123456789'; 

            // Construct elegant WhatsApp message
            const message = `✨ *Tempahan Hanim Henna* ✨\n\n`
                + `Salam, saya berminat untuk semak kekosongan slot:\n\n`
                + `*Nama:* ${name}\n`
                + `*Tarikh:* ${date}\n`
                + `*Pakej:* ${pkg}\n`
                + `*Details Lokasi Map:* ${locationMapDetails}\n\n`
                + `Mohon semak jadual. Terima kasih! 🤍`;

            // Encode string for URL
            const encodedMessage = encodeURIComponent(message);
            
            // Generate WhatsApp URL
            const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

            // Redirect user to WhatsApp
            window.location.href = whatsappUrl;
            
            // Close sheet after submission
            closeSheet();
        });
    }
});
