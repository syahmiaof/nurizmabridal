// ==========================================
// ADMIN MODULE LOGIC (Phase 4)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // === 1. VIEW TOGGLER (BOTTOM NAV) ===
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = ['view-dashboard', 'view-kalendar', 'view-bayaran'];

    const switchView = (targetId) => {
        // Update Nav UI
        navBtns.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.remove('text-plum/30');
                btn.classList.add('text-gold');
            } else {
                btn.classList.remove('text-gold');
                btn.classList.add('text-plum/30');
            }
        });

        // Update Views
        views.forEach(id => {
            const el = document.getElementById(id);
            if (id === targetId) {
                el.classList.remove('hidden');
                // Trigger reflow for fade-in (if using opacity transition)
                setTimeout(() => el.classList.remove('opacity-0'), 50);
            } else {
                el.classList.add('hidden', 'opacity-0');
            }
        });

        // Trigger specific refreshes based on view
        if(targetId === 'view-dashboard') loadDashboard();
        if(targetId === 'view-kalendar') renderCalendar();
        if(targetId === 'view-bayaran') loadBayaran();
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.target));
    });

    // === 2. DATA FETCHERS ===
    let packagesMap = {}; // store packages

    const loadPackages = async () => {
        const { data, error } = await supabaseClient.from('packages').select('*');
        if (!error && data) {
            const select = document.getElementById('add-package');
            select.innerHTML = '<option value="" disabled selected>Pilih Pakej</option>';
            data.forEach(pkg => {
                packagesMap[pkg.id] = pkg.name;
                const opt = document.createElement('option');
                opt.value = pkg.id;
                opt.textContent = `${pkg.name} - RM${pkg.price}`;
                select.appendChild(opt);
            });
        }
    };

    const loadDashboard = async () => {
        // Count bookings
        const { count: bookingCount, error: err1 } = await supabaseClient.from('bookings').select('*', { count: 'exact', head: true });
        // Count pending deposits
        const { count: pendingCount, error: err2 } = await supabaseClient.from('bayaran').select('*', { count: 'exact', head: true }).eq('status', 'Pending Deposit');
        
        document.getElementById('stat-bookings').textContent = err1 ? '?' : bookingCount;
        document.getElementById('stat-pending').textContent = err2 ? '?' : pendingCount;
    };

    const loadBayaran = async () => {
        const container = document.getElementById('bayaran-list');
        container.innerHTML = '<div class="text-center py-10 opacity-50 text-sm font-medium">Memuatkan data...</div>';

        // Fetch bayaran with booking details
        const { data, error } = await supabaseClient
            .from('bayaran')
            .select(`
                id, status, amount_paid, balance,
                bookings ( id, customer_name, package_id )
            `)
            .order('id', { ascending: false });

        if (error || !data) {
            container.innerHTML = '<div class="text-center py-10 text-red-500 text-sm">Ralat memuat turun data.</div>';
            return;
        }

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center py-10 opacity-50 text-sm">Belum ada rekod bayaran.</div>';
            return;
        }

        container.innerHTML = '';
        data.forEach(item => {
            const booking = item.bookings || {};
            const pkgName = packagesMap[booking.package_id] || 'Pakej Dibuang';
            
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl p-5 shadow-sm border border-plum/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
            
            // Status color logic
            let statusColor = 'bg-red-100 text-red-600';
            if (item.status === 'Deposit Dibayar') statusColor = 'bg-orange-100 text-orange-600';
            if (item.status === 'Selesai') statusColor = 'bg-green-100 text-green-600';

            card.innerHTML = `
                <div>
                    <h4 class="font-bold text-plum">${booking.customer_name || 'Tiada Nama'}</h4>
                    <p class="text-xs text-plum/60 mt-1">${pkgName}</p>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <select class="status-dropdown text-xs font-semibold py-2 px-3 rounded-xl border-none outline-none appearance-none cursor-pointer ${statusColor}" data-id="${item.id}">
                        <option value="Pending Deposit" ${item.status === 'Pending Deposit' ? 'selected' : ''}>Pending Deposit</option>
                        <option value="Deposit Dibayar" ${item.status === 'Deposit Dibayar' ? 'selected' : ''}>Deposit Dibayar</option>
                        <option value="Selesai" ${item.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                    </select>
                </div>
            `;
            container.appendChild(card);
        });

        // Add listeners to dropdowns
        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
            dropdown.addEventListener('change', async (e) => {
                const bayaranId = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                
                // Visual update before network to feel snappy
                e.target.className = `status-dropdown text-xs font-semibold py-2 px-3 rounded-xl border-none outline-none appearance-none cursor-pointer ${
                    newStatus === 'Selesai' ? 'bg-green-100 text-green-600' : 
                    newStatus === 'Deposit Dibayar' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                }`;

                const { error } = await supabaseClient.from('bayaran').update({ status: newStatus }).eq('id', bayaranId);
                if(error) alert('Ralat kemaskini status.');
                else loadDashboard(); // refresh dashboard stats
            });
        });
    };

    // === 3. SMART CALENDAR ===
    let currentDate = new Date();
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('cal-month');

    const renderCalendar = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Setup header
        const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
        monthDisplay.textContent = `${monthNames[month]} ${year}`;

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Fetch bookings for this month to highlight days
        const startDateString = `${year}-${String(month+1).padStart(2,'0')}-01`;
        const endDateString = `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`;
        const { data: bookingsData } = await supabaseClient.from('bookings')
            .select('date')
            .gte('date', startDateString)
            .lte('date', endDateString);
            
        const bookedDays = (bookingsData || []).map(b => parseInt(b.date.split('-')[2]));

        calendarGrid.innerHTML = '';

        // Empty slots before 1st day
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarGrid.appendChild(emptyDiv);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'py-3 rounded-full cursor-pointer transition-colors';
            dayDiv.textContent = i;

            if (bookedDays.includes(i)) {
                // Booked style
                dayDiv.classList.add('bg-plum', 'text-gold', 'shadow-md');
            } else {
                // Available style
                dayDiv.classList.add('hover:bg-lavender', 'text-plum');
            }

            // Click opens bottom sheet
            dayDiv.addEventListener('click', () => openBookingSheet(year, month, i));
            calendarGrid.appendChild(dayDiv);
        }
    };

    document.getElementById('cal-prev').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // === 4. BOTTOM SHEET & SOFT WARNING LOGIC ===
    const sheetBackdrop = document.getElementById('admin-sheet-backdrop');
    const sheet = document.getElementById('admin-sheet');
    const bookingForm = document.getElementById('admin-booking-form');
    const dateInput = document.getElementById('add-date');
    const warningOverlay = document.getElementById('warning-overlay');

    let pendingBookingData = null; // Store data temporarily if warning is triggered

    const openBookingSheet = (y, m, d) => {
        dateInput.value = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        sheetBackdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
            sheetBackdrop.classList.remove('opacity-0');
            sheet.classList.remove('translate-y-full');
        });
    };

    const closeBookingSheet = () => {
        sheetBackdrop.classList.add('opacity-0');
        sheet.classList.add('translate-y-full');
        setTimeout(() => sheetBackdrop.classList.add('hidden'), 300);
        bookingForm.reset();
    };

    sheetBackdrop.addEventListener('click', closeBookingSheet);

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather data
        const customer_name = document.getElementById('add-name').value;
        const date = document.getElementById('add-date').value;
        const start_time = document.getElementById('add-start').value + ':00'; // Ensure time format HH:MM:00
        const end_time = document.getElementById('add-end').value + ':00';
        const details_lokasi_map = document.getElementById('add-location').value;
        const package_id = document.getElementById('add-package').value;

        pendingBookingData = { customer_name, date, start_time, end_time, details_lokasi_map, package_id };

        // Soft Warning Check: Is there an existing booking on this date?
        const { data: existing } = await supabaseClient.from('bookings').select('id').eq('date', date);

        if (existing && existing.length > 0) {
            // Trigger Soft Warning
            warningOverlay.classList.remove('hidden');
            requestAnimationFrame(() => warningOverlay.classList.remove('opacity-0'));
        } else {
            // Save directly
            await executeSaveBooking();
        }
    });

    const executeSaveBooking = async () => {
        if(!pendingBookingData) return;

        // 1. Insert Booking
        const { data: bData, error: bErr } = await supabaseClient.from('bookings').insert([pendingBookingData]).select('id').single();
        
        if (bErr) {
            alert('Ralat menyimpan tempahan.');
            console.error(bErr);
            return;
        }

        // 2. Auto-generate Bayaran record (Pending Deposit)
        // Ensure amount is string/numeric. For MVP, we can leave amount_paid and balance as 0 or default since default is 0.
        const { error: pErr } = await supabaseClient.from('bayaran').insert([{
            booking_id: bData.id,
            status: 'Pending Deposit'
        }]);

        if (pErr) console.error("Error creating bayaran:", pErr);

        // Reset and Refresh
        pendingBookingData = null;
        closeWarningOverlay();
        closeBookingSheet();
        loadDashboard();
        renderCalendar();
    };

    const closeWarningOverlay = () => {
        warningOverlay.classList.add('opacity-0');
        setTimeout(() => warningOverlay.classList.add('hidden'), 300);
    };

    document.getElementById('warn-cancel').addEventListener('click', () => {
        pendingBookingData = null;
        closeWarningOverlay();
    });

    document.getElementById('warn-confirm').addEventListener('click', () => {
        executeSaveBooking(); // Proceed despite warning
    });

    // === INITIALIZATION ===
    loadPackages().then(() => {
        switchView('view-dashboard'); // Init first view
    });
});
