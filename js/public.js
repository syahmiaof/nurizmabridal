// ==========================================
// PUBLIC STOREFRONT LOGIC (Phase 5 Enhancement)
// ==========================================

// Dummy Gallery Data
const galleryData = [
    { url: 'assets/bridal/1.jpg' },
    { url: 'assets/bridal/156f2db41cccdee2e12afd6cebf6d3d2.jpg' },
    { url: 'assets/bridal/28b4de18ae9d1fbf81e4836cd0f7b4fa.jpg' },
    { url: 'assets/bridal/2e0a95c038c4b08857bbe79598bf781d.jpg' },
    { url: 'assets/bridal/3634c2c6c8652a66465ad4321e168055.jpg' },
    { url: 'assets/bridal/3e9f3005c5c8b4578ed9ca8edbed8a4c.jpg' },
    { url: 'assets/bridal/42dc04180efd660ff9d3e1b7620c2984.jpg' },
    { url: 'assets/bridal/44b3efbc65b01d6d00d55ff6914ee5fa.jpg' },
    { url: 'assets/bridal/45c740e5410fbf577edf58ede89a75cf.jpg' },
    { url: 'assets/bridal/5ccc0be27eacf0e6e524fca7d7b699d6.jpg' },
    { url: 'assets/bridal/69dfdfe4f0d79bdfaf19190decb00717.webp' },
    { url: 'assets/bridal/9a2d5394e8e061f4a30441715c398f64.jpg' },
    { url: 'assets/bridal/9b95d0b3cfbf60ece3612a777f5bd6ad.jpg' },
    { url: 'assets/bridal/Brides-Hands-and-Fingernails-Henna-scaled-e1588034478376.jpg' },
    { url: 'assets/bridal/a67776a26c598eea7c872d11c0402059.jpg' },
    { url: 'assets/bridal/ba6602452174a909a4b8f7ffe702aeed.jpg' },
    { url: 'assets/bridal/beautiful-henna-to-prepare-for-the-wedding-day-photo.jpg' },
    { url: 'assets/bridal/d3fb9b0e4454199b1782137045d34df2.jpg' },
    { url: 'assets/bridal/d425734131aaa9ed9f7db60cd46bc400.jpg' },
    { url: 'assets/bridal/f49b36bc2cd85f0c483e2c0ae579b0ce.jpg' },
    { url: 'assets/bridal/f8689e54e901cf915652ad8b80dac64f.jpg' },
    { url: 'assets/bridal/henna-tattoo-bride-s-hand_33482-848.avif' },
    { url: 'assets/bridal/henna-tattoo-bride-s-hand_33482-850.avif' },
    { url: 'assets/bridal/henna-tattoo-hands-holding-white-dress-girl-tattos-76782572.webp' },
    { url: 'assets/bridal/id-11134207-7qul1-lf6nndk3rq9ne2.jpg' },
    { url: 'assets/bridal/istockphoto-1202917528-612x612.jpg' },
    { url: 'assets/bridal/istockphoto-1345687467-612x612.jpg' },
    { url: 'assets/bridal/istockphoto-907768596-612x612.jpg' },
    { url: 'assets/bridal/malay-bride-henna-carved-beautiful-unique-selective-focus-tones-image_33482-1032.avif' },
    { url: 'assets/bridal/mehndi-5.avif' },
    { url: 'assets/bridal/muslim-bride.jpg' },
    { url: 'assets/bridal/pexels-abirjoy999-22940768.jpg' },
    { url: 'assets/bridal/pexels-photo-5912545.jpg' }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- LIVE BACKGROUND: STARFIELD ---
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * -0.5 - 0.2; // Float upwards slightly
                this.opacity = Math.random();
                this.fadeSpeed = Math.random() * 0.02 + 0.005;
                this.fadeDir = Math.random() > 0.5 ? 1 : -1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Twinkle effect
                this.opacity += this.fadeSpeed * this.fadeDir;
                if (this.opacity >= 1) {
                    this.opacity = 1;
                    this.fadeDir = -1;
                } else if (this.opacity <= 0.1) {
                    this.opacity = 0.1;
                    this.fadeDir = 1;
                }

                // Reset position if off screen
                if (this.y < 0) this.y = height;
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
            }
            draw() {
                ctx.beginPath();
                // Gold star color matching theme: rgba(212, 175, 55, opacity)
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initStars = () => {
            stars = [];
            // Create about 100 stars for a magical effect
            for (let i = 0; i < 100; i++) {
                stars.push(new Star());
            }
        };

        const animateStars = () => {
            ctx.clearRect(0, 0, width, height);
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            requestAnimationFrame(animateStars);
        };

        window.addEventListener('resize', () => {
            resize();
            initStars();
        });

        resize();
        initStars();
        animateStars();
    }

    // --- NAVBAR SCROLL EFFECT ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('shadow-md');
        } else {
            nav.classList.remove('shadow-md');
        }
    });

    // --- ANIMATED COUNTERS ---
    const counters = document.querySelectorAll('.counter');
    
    // Function to animate a single counter
    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const duration = 3000; // 3 seconds for a satisfying slow count
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart) for a satisfying deceleration at the end
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentVal = Math.ceil(target * easeProgress);
            
            counter.innerText = currentVal;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target;
            }
        };
        
        requestAnimationFrame(updateCount);
    };

    // Intersection Observer to start animation when visible
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetCounters = entry.target.querySelectorAll('.counter');
                targetCounters.forEach(counter => {
                    // Reset to 0 before starting just in case
                    counter.innerText = '0'; 
                    animateCounter(counter);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const milestoneSection = document.getElementById('milestone');
    if(milestoneSection) {
        observer.observe(milestoneSection);
    }

    // --- PORTFOLIO GALLERY LOGIC ---
    const grid = document.getElementById('gallery-grid');
    if(grid) {
        grid.innerHTML = ''; // clear existing
        galleryData.forEach(item => {
            const img = document.createElement('img');
            img.src = item.url;
            // Add classes for a beautiful masonry look
            img.className = 'w-full rounded-2xl shadow-sm mb-4 object-cover hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] border border-gold/10 cursor-pointer';
            
            // Lightbox trigger
            img.addEventListener('click', () => {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                if(lightbox && lightboxImg) {
                    lightboxImg.src = item.url;
                    lightbox.classList.remove('opacity-0', 'pointer-events-none');
                    setTimeout(() => lightboxImg.classList.remove('scale-95'), 10);
                }
            });
            grid.appendChild(img);
        });

        // Lightbox close logic
        const lightbox = document.getElementById('lightbox');
        const closeLightboxBtn = document.getElementById('close-lightbox');
        const closeLightbox = () => {
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.classList.add('scale-95');
            lightbox.classList.add('opacity-0', 'pointer-events-none');
        };
        if(lightbox) {
            lightbox.addEventListener('click', (e) => {
                if(e.target === lightbox) closeLightbox();
            });
            closeLightboxBtn.addEventListener('click', closeLightbox);
        }
    }

    // --- BEFORE / AFTER SLIDER LOGIC ---
    const compareContainer = document.getElementById('compare-container');
    if (compareContainer) {
        const afterImg = document.getElementById('compare-after');
        const compareLine = document.getElementById('compare-line');
        let isSliding = false;

        const slide = (clientX) => {
            const bounds = compareContainer.getBoundingClientRect();
            // Calculate cursor position relative to container
            let pos = clientX - bounds.left;
            // Constrain position within container width
            pos = Math.max(0, Math.min(pos, bounds.width));
            
            // Calculate percentage
            const percentage = (pos / bounds.width) * 100;
            
            // Update line position and clip-path
            compareLine.style.left = `${percentage}%`;
            afterImg.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        };

        // Mouse Events
        compareContainer.addEventListener('mousedown', () => isSliding = true);
        window.addEventListener('mouseup', () => isSliding = false);
        window.addEventListener('mousemove', (e) => {
            if (isSliding) slide(e.clientX);
        });

        // Touch Events
        compareContainer.addEventListener('touchstart', (e) => {
            isSliding = true;
            slide(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchend', () => isSliding = false);
        window.addEventListener('touchmove', (e) => {
            if (isSliding) slide(e.touches[0].clientX);
        }, { passive: true });
    }

    // --- FOMO POPUP LOGIC ---
    const fomoModal = document.getElementById('fomo-modal');
    const closeFomo = document.getElementById('close-fomo');
    const fomoContent = document.getElementById('fomo-content');

    if (fomoModal && closeFomo && fomoContent) {
        // Show after 2 seconds
        setTimeout(() => {
            fomoModal.classList.remove('opacity-0', 'pointer-events-none');
            fomoContent.classList.remove('scale-95');
            fomoContent.classList.add('scale-100');
        }, 2000);

        // Close on button click
        closeFomo.addEventListener('click', () => {
            fomoModal.classList.add('opacity-0', 'pointer-events-none');
            fomoContent.classList.remove('scale-100');
            fomoContent.classList.add('scale-95');
        });
    }

    // --- PUBLIC LIVE CALENDAR ---
    let pubCurrentDate = new Date();
    const pubCalendarGrid = document.getElementById('pub-calendar-grid');
    const pubMonthDisplay = document.getElementById('pub-cal-month');

    const renderPublicCalendar = async () => {
        if (!pubCalendarGrid || typeof supabaseClient === 'undefined') return;

        const year = pubCurrentDate.getFullYear();
        const month = pubCurrentDate.getMonth();
        
        const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
        pubMonthDisplay.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const startDateString = `${year}-${String(month+1).padStart(2,'0')}-01`;
        const endDateString = `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`;
        
        const { data: bookingsData } = await supabaseClient.from('bookings')
            .select('date')
            .gte('date', startDateString)
            .lte('date', endDateString);
            
        const bookedDaysCount = {};
        (bookingsData || []).forEach(b => {
            const d = parseInt(b.date.split('-')[2]);
            bookedDaysCount[d] = (bookedDaysCount[d] || 0) + 1;
        });

        pubCalendarGrid.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            pubCalendarGrid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'py-3 rounded-full transition-colors relative';
            dayDiv.textContent = i;

            const isToday = (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear());
            if (isToday) {
                dayDiv.classList.add('ring-1', 'ring-gold/50');
            }

            const count = bookedDaysCount[i] || 0;
            if (count >= 5) {
                // Full slot
                dayDiv.classList.add('bg-red-500/20', 'text-red-500', 'font-bold', 'opacity-70', 'cursor-not-allowed');
                dayDiv.title = 'Telah Penuh';
            } else {
                // Available
                dayDiv.classList.add('hover:bg-gold/10', 'text-ivory', 'font-semibold', 'shadow-[0_2px_10px_rgba(212,175,55,0.05)]', 'cursor-pointer');
                dayDiv.addEventListener('click', () => {
                    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                    window.openPubTimeModal(dateStr);
                });
            }
            pubCalendarGrid.appendChild(dayDiv);
        }
    };

    if (document.getElementById('pub-cal-prev')) {
        document.getElementById('pub-cal-prev').addEventListener('click', () => {
            pubCurrentDate.setMonth(pubCurrentDate.getMonth() - 1);
            renderPublicCalendar();
        });
        document.getElementById('pub-cal-next').addEventListener('click', () => {
            pubCurrentDate.setMonth(pubCurrentDate.getMonth() + 1);
            renderPublicCalendar();
        });
        renderPublicCalendar();
    }

    // --- FETCH PACKAGES FOR BOOKING FORM ---
    const loadPublicPackages = async () => {
        const select = document.getElementById('book-package');
        if (!select || typeof supabaseClient === 'undefined') return;

        const { data, error } = await supabaseClient.from('packages').select('*').order('id', { ascending: true });
        if (!error && data) {
            select.innerHTML = '<option value="" disabled selected>Pilih Pakej</option>';
            data.forEach(pkg => {
                if (pkg.is_hidden) return; // Skip hidden packages
                const opt = document.createElement('option');
                opt.value = pkg.name; // Use name for whatsapp
                opt.textContent = pkg.name;
                opt.className = 'bg-dark text-ivory';
                select.appendChild(opt);
            });
        }
    };
    loadPublicPackages();

    // --- WHATSAPP GENERATOR FORM LOGIC ---
    const pubBookingForm = document.getElementById('pub-booking-form');
    if (pubBookingForm) {
        pubBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('book-name').value;
            const date = document.getElementById('book-date').value;
            const time = document.getElementById('book-time').value;
            const pkg = document.getElementById('book-package').value;
            const location = document.getElementById('book-location').value;

            const timeFormatted = formatTime12HrPub(time);

            const text = `Hai Hanim Henna, saya berminat untuk menempah slot inai pengantin.\n\n` +
                         `*Nama:* ${name}\n` +
                         `*Tarikh:* ${date}\n` +
                         `*Masa:* ${timeFormatted}\n` +
                         `*Pakej:* ${pkg}\n` +
                         `*Lokasi Bersiap:* ${location}\n\n` +
                         `Terima kasih!`;

            const encodedText = encodeURIComponent(text);
            const phone = '601123313495'; // Admin phone number
            const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;

            window.open(whatsappUrl, '_blank');
            window.closeBookingSheet();
        });
        
        document.getElementById('book-date').addEventListener('change', (e) => {
            if(e.target.value) window.checkAvailableSlots(e.target.value);
        });
    }

}); // end DOMContentLoaded

window.checkAvailableSlots = async (dateStr) => {
    const timeSelect = document.getElementById('book-time');
    if(!timeSelect) return;
    
    Array.from(timeSelect.options).forEach(opt => {
        if(opt.value) {
            opt.disabled = true;
            opt.textContent = opt.textContent.replace(' (Penuh)', '').replace(' (Menyemak...)', '') + ' (Menyemak...)';
        }
    });

    const { data: bookings } = await supabaseClient.from('bookings').select('start_time').eq('date', dateStr);
    const bookedStarts = (bookings || []).map(b => b.start_time);

    Array.from(timeSelect.options).forEach(opt => {
        if(opt.value) {
            opt.textContent = opt.textContent.replace(' (Menyemak...)', '');
            if(bookedStarts.includes(opt.value)) {
                opt.disabled = true;
                opt.textContent += ' (Penuh)';
            } else {
                opt.disabled = false;
            }
        }
    });
    
    if(timeSelect.options[timeSelect.selectedIndex] && timeSelect.options[timeSelect.selectedIndex].disabled) {
        timeSelect.value = '';
    }
};

// --- BOTTOM SHEET LOGIC ---
window.openBookingSheet = () => {
    const backdrop = document.getElementById('pub-sheet-backdrop');
    const sheet = document.getElementById('pub-sheet');
    if(backdrop && sheet) {
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
            backdrop.classList.remove('opacity-0');
            sheet.classList.remove('translate-y-full');
        });
    }
};

window.closeBookingSheet = () => {
    const backdrop = document.getElementById('pub-sheet-backdrop');
    const sheet = document.getElementById('pub-sheet');
    if(backdrop && sheet) {
        backdrop.classList.add('opacity-0');
        sheet.classList.add('translate-y-full');
        setTimeout(() => backdrop.classList.add('hidden'), 300);
    }
};

// --- PUBLIC TIME MODAL LOGIC ---
const formatTime12HrPub = (timeStr) => {
    if (!timeStr) return '';
    let [h, m] = timeStr.split(':');
    h = parseInt(h);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2,'0')}:${m} ${ampm}`;
};

window.openPubTimeModal = async (dateStr) => {
    const modal = document.getElementById('pub-time-modal');
    const container = document.getElementById('pub-time-slots-container');
    const label = document.getElementById('pub-time-date-label');
    
    label.textContent = `Tarikh: ${dateStr}`;
    container.innerHTML = `<div class="col-span-2 sm:col-span-3 text-center py-8 text-gold"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2 text-xs">Menyemak jadual...</p></div>`;
    
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0'));

    // Fetch bookings for this date
    const { data: bookings } = await supabaseClient.from('bookings').select('start_time').eq('date', dateStr);
    const bookedStarts = (bookings || []).map(b => b.start_time);

    container.innerHTML = '';
    
    // Fixed 5 slots
    const fixedSlots = ['07:00:00', '10:00:00', '14:00:00', '17:00:00', '20:30:00'];
    
    for (const timeStr of fixedSlots) {
        const displayTime = formatTime12HrPub(timeStr);
        
        const el = document.createElement('div');
        const isBooked = bookedStarts.includes(timeStr);

        if (isBooked) {
            el.className = 'border border-red-900/30 bg-red-900/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-not-allowed opacity-50 aspect-[2/1] relative overflow-hidden';
            el.innerHTML = `
                <div class="text-white/60 font-bold mb-1 line-through">${displayTime}</div>
                <div class="text-[10px] font-bold text-red-400">PENUH</div>
            `;
        } else {
            el.className = 'border border-gold/30 bg-gold/5 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/20 hover:border-gold transition-colors aspect-[2/1] group shadow-inner';
            el.innerHTML = `
                <div class="text-ivory group-hover:text-gold font-bold mb-1 transition-colors">${displayTime}</div>
                <div class="text-[10px] font-bold text-gold/70 group-hover:text-gold">KOSONG</div>
            `;
            el.onclick = () => {
                // Set the booking form values
                document.getElementById('book-date').value = dateStr;
                window.checkAvailableSlots(dateStr).then(() => {
                    document.getElementById('book-time').value = timeStr;
                });
                
                // Close modal and open form
                modal.classList.add('opacity-0');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    window.openBookingSheet();
                }, 300);
            };
        }
        container.appendChild(el);
    }
};

if (document.getElementById('pub-sheet-backdrop')) {
    document.getElementById('pub-sheet-backdrop').addEventListener('click', window.closeBookingSheet);
}

// Keep old fallback just in case
window.openBooking = window.openBookingSheet;
window.closeBooking = window.closeBookingSheet;

// End of file
