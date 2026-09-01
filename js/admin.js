document.addEventListener('DOMContentLoaded', async () => {
    // === 1. SETUP SUPABASE ===
    // supabaseClient is already instantiated globally in js/config.js

    // Global State
    let selectedDate = new Date(); // default today
    let currentBookings = [];
    let currentSales = [];
    let packagesMap = {};
    window.slotViewMode = 'list';
    let packagePrices = {};

    // Generate Date String YYYY-MM-DD
    const formatDateStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Parse YYYY-MM-DD to Date object safely
    const parseDateStr = (str) => {
        const parts = str.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    // Format Time (09:00:00 -> 09:00 AM)
    const formatTime12Hr = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${String(h).padStart(2,'0')}:${m} ${ampm}`;
    };

    // Month names
    const monthNames = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    const dayNames = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"];

    // === 2. INITIALIZATION ===
    const init = async () => {
        await loadPackages();
        renderDateSlider();
        await loadDateData();
    };

    const loadPackages = async () => {
        const { data } = await supabaseClient.from('packages').select('*');
        const select = document.getElementById('add-package');
        const editSelect = document.getElementById('edit-package');
        select.innerHTML = '<option value="">Pilih Pakej...</option>';
        if (editSelect) editSelect.innerHTML = '<option value="">Pilih Pakej...</option>';
        
        if (data) {
            data.forEach(p => {
                packagesMap[p.id] = p.name;
                packagePrices[p.id] = p.price;
                
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                select.appendChild(opt);

                if (editSelect) {
                    const opt2 = document.createElement('option');
                    opt2.value = p.id;
                    opt2.textContent = p.name;
                    editSelect.appendChild(opt2);
                }
            });
        }
    };

    // === 3. DATE SLIDER ===
    const renderDateSlider = () => {
        const slider = document.getElementById('date-slider');
        slider.innerHTML = '';
        
        const today = new Date();
        // Generate from 7 days before SELECTED date to 30 days future
        const startDate = new Date(selectedDate);
        startDate.setDate(selectedDate.getDate() - 7);

        for (let i = 0; i < 40; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = formatDateStr(d);
            
            const isSelected = formatDateStr(d) === formatDateStr(selectedDate);
            const isToday = formatDateStr(d) === formatDateStr(today);

            const el = document.createElement('div');
            el.className = `flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl cursor-pointer transition-all snap-center ${
                isSelected ? 'bg-gradient-to-b from-gold to-gold/70 text-dark shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' : 
                isToday ? 'bg-white/10 border border-gold/50 text-gold' : 'bg-charcoal border border-white/5 text-ivory/50 hover:bg-white/5'
            }`;
            
            el.innerHTML = `
                <span class="text-[10px] font-bold tracking-wider mb-1">${dayNames[d.getDay()]}</span>
                <span class="text-2xl font-bold font-serif leading-none">${d.getDate()}</span>
                <span class="text-[10px] font-semibold mt-1">${monthNames[d.getMonth()]}</span>
            `;

            el.addEventListener('click', () => {
                selectedDate = d;
                renderDateSlider(); // re-render to update selected styling
                loadDateData();
            });

            slider.appendChild(el);

            // Auto-scroll to selected
            if (isSelected) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }, 100);
            }
        }

        // Bind date picker listener once
        const datePicker = document.getElementById('admin-date-picker');
        if (datePicker && !datePicker.hasAttribute('data-bound')) {
            datePicker.setAttribute('data-bound', 'true');
            datePicker.addEventListener('change', (e) => {
                if (e.target.value) {
                    selectedDate = parseDateStr(e.target.value);
                    renderDateSlider();
                    loadDateData();
                }
            });
        }
    };

    // === 4. DATA LOADING ===
    const loadDateData = async () => {
        const dateStr = formatDateStr(selectedDate);
        
        // Fetch Bookings for the day
        const { data: bData } = await supabaseClient.from('bookings')
            .select(`
                id, date, customer_name, customer_phone, start_time, end_time, details_lokasi_map, package_id,
                bayaran (amount_paid, balance)
            `)
            .eq('date', dateStr);
            
        currentBookings = bData || [];

        // Fetch Product Sales for the day
        const { data: pData } = await supabaseClient.from('product_sales')
            .select('*')
            .eq('date', dateStr);
            
        currentSales = pData || [];

        renderTimeSlots();
        renderProductSales();
        updateBottomBar();
    };

    const updateBottomBar = async () => {
        // Get all bookings for all-time stats
        const { data: bAll } = await supabaseClient.from('bookings').select('id, bayaran(amount_paid, balance)');
        // Get all sales for all-time stats
        const { data: pAll } = await supabaseClient.from('product_sales').select('price');

        const totalSlots = (bAll || []).length;
        
        let totalRevS = 0;
        let totalRevP = 0;
        (bAll || []).forEach(b => { 
            if (b.bayaran && b.bayaran.length > 0) {
                totalRevS += parseFloat(b.bayaran[0].amount_paid || 0) + parseFloat(b.bayaran[0].balance || 0);
            }
        });
        (pAll || []).forEach(p => { totalRevP += parseFloat(p.price || 0); });

        const totalRev = totalRevS + totalRevP;

        document.getElementById('bottom-total-slots').textContent = totalSlots;
        document.getElementById('bottom-total-revenue').textContent = totalRev.toFixed(2);
        
        const revSNode = document.getElementById('rev-s');
        const revPNode = document.getElementById('rev-p');
        if(revSNode) revSNode.textContent = totalRevS.toFixed(2);
        if(revPNode) revPNode.textContent = totalRevP.toFixed(2);
    };

    // === 5. RENDER SLOT SERVIS ===
    const renderTimeSlots = () => {
        const container = document.getElementById('time-slots-container');
        container.innerHTML = '';
        
        document.getElementById('slot-count-badge').textContent = `${currentBookings.length} slot hari ini`;

        // Apply grid classes based on view mode
        container.className = 'pb-32'; // reset
        if (window.slotViewMode === 'list') {
            container.classList.add('space-y-3');
        } else if (window.slotViewMode === 'grid') {
            container.classList.add('grid', 'grid-cols-2', 'gap-3');
        } else if (window.slotViewMode === 'compact') {
            container.classList.add('grid', 'grid-cols-4', 'gap-2');
        }

        // Fixed 5 slots
        const fixedSlots = ['07:00:00', '10:00:00', '14:00:00', '17:00:00', '20:30:00'];
        const allSlotsSet = new Set(fixedSlots);
        
        currentBookings.forEach(b => {
            if (b.start_time) {
                allSlotsSet.add(b.start_time);
            }
        });
        
        const allSlotsArray = Array.from(allSlotsSet).sort();

        for (const timeStr of allSlotsArray) {
            const displayTime = formatTime12Hr(timeStr);
            const timeParts = displayTime.split(' ');

            const b = currentBookings.find(bk => bk.start_time === timeStr);

            const el = document.createElement('div');

            if (b) {
                // === BOOKED SLOT ===
                const pkgName = packagesMap[b.package_id] || 'Pakej Custom';
                let price = packagePrices[b.package_id] || 0;
                if (b.bayaran && b.bayaran.length > 0) {
                    price = parseFloat(b.bayaran[0].amount_paid || 0) + parseFloat(b.bayaran[0].balance || 0);
                }
                
                if (window.slotViewMode === 'list') {
                    el.className = 'bg-[#0f2e20] border border-green-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden';
                    el.innerHTML = `
                        <div class="flex items-center gap-4 relative z-10">
                            <div class="w-16 flex flex-col items-center border-r border-white/10 pr-4">
                                <i class="far fa-clock text-green-400 mb-1"></i>
                                <span class="text-xs font-bold text-ivory">${timeParts[0]}</span>
                                <span class="text-[9px] text-ivory/50">${timeParts[1]}</span>
                            </div>
                            <div>
                                <div class="font-bold text-ivory flex items-center gap-2">
                                    ${b.customer_name} <i class="fas fa-check text-green-400 text-xs"></i>
                                </div>
                                <div class="text-[10px] text-ivory/60 mt-1">${pkgName}</div>
                            </div>
                        </div>
                        <div class="flex gap-2 relative z-10">
                            <button onclick="openBookingDetails(${b.id})" class="w-10 h-10 rounded-full bg-white/5 text-ivory flex items-center justify-center hover:bg-white/10 transition-colors z-20">
                                <i class="far fa-user"></i>
                            </button>
                            ${b.customer_phone ? `
                            <a href="https://wa.me/60${b.customer_phone.replace(/^0/, '')}" target="_blank" class="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/40 transition-colors z-20">
                                <i class="fab fa-whatsapp text-lg"></i>
                            </a>
                            ` : ''}
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent to-green-900/10 pointer-events-none"></div>
                    `;
                } 
                else if (window.slotViewMode === 'grid') {
                    el.className = 'bg-[#0f2e20] border border-green-500/30 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden aspect-[2/1] shadow-lg cursor-pointer hover:brightness-110 transition-all';
                    el.onclick = () => openBookingDetails(b.id);
                    el.innerHTML = `
                        <div class="text-ivory font-bold mb-2">${displayTime}</div>
                        <div class="text-xs text-ivory font-semibold truncate w-full text-center px-1">
                            ${b.customer_name} <i class="fas fa-check text-green-400 text-[10px]"></i>
                        </div>
                        ${b.customer_phone ? `
                            <div class="absolute bottom-1 right-2 text-green-500/30"><i class="fab fa-whatsapp"></i></div>
                        ` : ''}
                    `;
                }
                else if (window.slotViewMode === 'compact') {
                    el.className = 'bg-[#0f2e20] border border-green-500/30 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden aspect-[2/1] shadow-lg cursor-pointer hover:brightness-110 transition-all';
                    el.onclick = () => openBookingDetails(b.id);
                    el.innerHTML = `
                        <div class="text-white/60 line-through font-bold text-xs mb-1">${timeParts[0]}</div>
                        <div class="text-[9px] text-ivory/50 line-through">${timeParts[1]}</div>
                    `;
                }
            } else {
                // === AVAILABLE SLOT ===
                if (window.slotViewMode === 'list') {
                    el.className = 'border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group';
                    el.innerHTML = `
                        <div class="flex items-center gap-4">
                            <div class="w-16 flex flex-col items-center border-r border-white/10 pr-4">
                                <i class="far fa-clock text-gold/50 group-hover:text-gold mb-1 transition-colors"></i>
                                <span class="text-xs font-bold text-ivory/70 group-hover:text-ivory transition-colors">${timeParts[0]}</span>
                                <span class="text-[9px] text-ivory/40 group-hover:text-ivory/60 transition-colors">${timeParts[1]}</span>
                            </div>
                        </div>
                        <div class="text-sm font-semibold text-ivory/50 group-hover:text-gold transition-colors flex items-center gap-2 pr-2">
                            Available <i class="fas fa-plus"></i>
                        </div>
                    `;
                }
                else if (window.slotViewMode === 'grid') {
                    el.className = 'border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group aspect-[2/1]';
                    el.innerHTML = `
                        <div class="text-gold/70 group-hover:text-gold font-bold mb-2 transition-colors">${displayTime}</div>
                        <div class="text-xs text-ivory/50 group-hover:text-gold transition-colors font-medium">Available +</div>
                    `;
                }
                else if (window.slotViewMode === 'compact') {
                    el.className = 'border border-white/10 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-gold/30 transition-colors group aspect-[2/1]';
                    el.innerHTML = `
                        <div class="text-gold/80 font-bold text-xs mb-1 group-hover:text-gold">${timeParts[0]}</div>
                        <div class="text-[9px] text-ivory/50 group-hover:text-ivory/80">${timeParts[1]}</div>
                    `;
                }

                // Attach click event to all available slots
                el.addEventListener('click', () => {
                    document.getElementById('add-date').value = formatDateStr(selectedDate);
                    document.getElementById('add-time').value = timeStr;
                    document.getElementById('modal-time-label').textContent = `Tarikh: ${formatDateStr(selectedDate)} | Masa: ${displayTime}`;
                    openModal('add-booking-modal');
                });
            }
            container.appendChild(el);
        }
    };

    // === 6. RENDER PRODUCT SALES ===
    const renderProductSales = () => {
        const container = document.getElementById('product-sales-container');
        container.innerHTML = '';
        
        if (currentSales.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-ivory/40 text-sm">Tiada jualan produk direkodkan untuk hari ini.</div>`;
            return;
        }

        currentSales.forEach(s => {
            const el = document.createElement('div');
            el.className = 'bg-charcoal border border-white/10 rounded-2xl p-4 flex items-center justify-between';
            el.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <div>
                        <div class="font-bold text-sm text-ivory">${s.item_name}</div>
                        <div class="text-xs text-ivory/50">Direkodkan pada ${formatTime12Hr(s.created_at.split('T')[1])}</div>
                    </div>
                </div>
                <div class="font-bold text-gold">RM ${parseFloat(s.price).toFixed(2)}</div>
            `;
            container.appendChild(el);
        });
    };

    // === 7. MODALS & TAB LOGIC ===
    window.changeViewMode = (mode) => {
        window.slotViewMode = mode;
        
        // Reset buttons
        const modes = ['list', 'grid', 'compact'];
        modes.forEach(m => {
            const btn = document.getElementById(`btn-view-${m}`);
            if (m === mode) {
                btn.className = 'p-1.5 px-2 bg-white/10 text-gold rounded-lg transition-colors shadow-sm';
            } else {
                btn.className = 'p-1.5 px-2 text-ivory/40 hover:text-ivory rounded-lg transition-colors';
            }
        });

        // Re-render slots
        renderTimeSlots();
    };

    window.switchMainTab = (tab) => {
        const btnServis = document.getElementById('tab-servis');
        const btnProduk = document.getElementById('tab-produk');
        const viewServis = document.getElementById('view-servis');
        const viewProduk = document.getElementById('view-produk');

        if(tab === 'servis') {
            btnServis.className = 'flex-1 py-2.5 text-sm font-bold rounded-lg bg-white/10 text-gold shadow-sm transition-all';
            btnProduk.className = 'flex-1 py-2.5 text-sm font-bold rounded-lg text-ivory/50 hover:text-ivory transition-all';
            viewServis.classList.remove('hidden');
            viewProduk.classList.add('hidden');
        } else {
            btnProduk.className = 'flex-1 py-2.5 text-sm font-bold rounded-lg bg-white/10 text-gold shadow-sm transition-all';
            btnServis.className = 'flex-1 py-2.5 text-sm font-bold rounded-lg text-ivory/50 hover:text-ivory transition-all';
            viewProduk.classList.remove('hidden');
            viewServis.classList.add('hidden');
        }
    };

    window.openCustomBookingModal = () => {
        document.getElementById('add-date').value = formatDateStr(selectedDate);
        document.getElementById('add-time').value = '12:00';
        document.getElementById('modal-time-label').textContent = `Tarikh: ${formatDateStr(selectedDate)} | Masa: Custom`;
        window.openModal('add-booking-modal');
    };

    window.openModal = (id) => {
        const modal = document.getElementById(id);
        modal.classList.remove('hidden');
        requestAnimationFrame(() => modal.classList.remove('opacity-0'));
        if (id === 'report-modal') {
            window.fetchReportData();
        }
    };

    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
        // Reset forms inside if any
        const form = modal.querySelector('form');
        if(form) form.reset();
    };

    // === 8. FORM SUBMISSIONS ===
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('add-date').value;
        const start_time = document.getElementById('add-time').value;
        // End time is simply start time + 1 hour for MVP
        let [h, m, s] = start_time.split(':');
        const end_time = `${String(parseInt(h) + 1).padStart(2,'0')}:${m}:${s}`;
        
        const customer_name = document.getElementById('add-name').value;
        const customer_phone = document.getElementById('add-phone').value;
        const package_id = document.getElementById('add-package').value;
        const details_lokasi_map = document.getElementById('add-location').value;
        const customPrice = document.getElementById('add-custom-price').value;

        const finalPrice = customPrice ? parseFloat(customPrice) : packagePrices[package_id];

        const { data: bData, error } = await supabaseClient.from('bookings').insert([{
            date, start_time, end_time, customer_name, customer_phone, package_id, details_lokasi_map
        }]).select();

        if (error) {
            alert('Ralat menyimpan tempahan: ' + error.message);
        } else if (bData && bData.length > 0) {
            const bookingId = bData[0].id;
            await supabaseClient.from('bayaran').insert([{
                booking_id: bookingId,
                amount_paid: 0,
                balance: finalPrice,
                status: 'Pending Deposit'
            }]);
            
            closeModal('add-booking-modal');
            loadDateData(); // Refresh UI
            if (!document.getElementById('report-modal').classList.contains('hidden')) {
                window.fetchReportData();
            }
        }
    });

    document.getElementById('edit-booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-booking-id').value;
        const date = document.getElementById('edit-date').value;
        const start_time = document.getElementById('edit-time').value;
        
        let [h, m, s] = start_time.split(':');
        s = s || '00';
        const end_time = `${String(parseInt(h) + 1).padStart(2,'0')}:${m}:${s}`;

        const customer_name = document.getElementById('edit-name').value;
        const customer_phone = document.getElementById('edit-phone').value;
        const package_id = document.getElementById('edit-package').value;
        const details_lokasi_map = document.getElementById('edit-location').value;
        const customPrice = document.getElementById('edit-custom-price').value;

        const paymentStatus = document.getElementById('edit-payment-status').value;
        const finalPrice = customPrice ? parseFloat(customPrice) : packagePrices[package_id];

        const { error: bError } = await supabaseClient.from('bookings').update({
            date, start_time, end_time, customer_name, customer_phone, package_id, details_lokasi_map
        }).eq('id', id);

        if (bError) {
            alert('Ralat kemaskini tempahan: ' + bError.message);
            return;
        }

        // Fetch bayaran to recalculate balance
        const { data: bayaranData } = await supabaseClient.from('bayaran').select('id, amount_paid').eq('booking_id', id);
        
        let paid = 0;
        let bayaranId = null;
        if (bayaranData && bayaranData.length > 0) {
            paid = parseFloat(bayaranData[0].amount_paid || 0);
            bayaranId = bayaranData[0].id;
        }
        
        if (paymentStatus === 'Selesai') {
            paid = finalPrice;
        } else if (paymentStatus === 'Pending Deposit') {
            paid = 0;
        } else if (paymentStatus === 'Deposit Dibayar' && paid === 0) {
            paid = 50; // Assume minimum deposit if changed from Pending to Deposit
        }
        
        let newBalance = finalPrice - paid;
        if (newBalance < 0) newBalance = 0;
        
        if (bayaranId) {
            const { error: errUpdate } = await supabaseClient.from('bayaran').update({
                amount_paid: paid,
                balance: newBalance,
                status: paymentStatus
            }).eq('id', bayaranId);
            if (errUpdate) alert('Ralat kemaskini bayaran: ' + errUpdate.message);
        } else {
            const { error: errInsert } = await supabaseClient.from('bayaran').insert([{
                booking_id: id,
                amount_paid: paid,
                balance: newBalance,
                status: paymentStatus
            }]);
            if (errInsert) alert('Ralat simpan bayaran: ' + errInsert.message);
        }

        closeModal('edit-booking-modal');
        loadDateData();
        if (!document.getElementById('report-modal').classList.contains('hidden')) {
            window.fetchReportData();
        }
        
        // If date changed, maybe jump to that date
        if (date !== formatDateStr(selectedDate)) {
            selectedDate = parseDateStr(date);
            renderDateSlider();
            loadDateData();
        }
    });

    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = formatDateStr(selectedDate);
        const item_name = document.getElementById('prod-name').value;
        const price = document.getElementById('prod-price').value;

        const { error } = await supabaseClient.from('product_sales').insert([{
            date, item_name, price
        }]);

        if (error) {
            alert('Ralat menyimpan jualan: ' + error.message);
        } else {
            closeModal('add-product-modal');
            loadDateData();
            if (!document.getElementById('report-modal').classList.contains('hidden')) {
                window.fetchReportData();
            }
        }
    });

    window.openAddProductModal = () => {
        openModal('add-product-modal');
    };

    window.openEditProductModal = (id) => {
        const p = window.allReportSales.find(x => String(x.id) === String(id));
        if(!p) return;

        document.getElementById('edit-prod-id').value = p.id;
        document.getElementById('edit-prod-date').value = p.date;
        document.getElementById('edit-prod-name').value = p.item_name;
        document.getElementById('edit-prod-price').value = p.price;

        openModal('edit-product-modal');
    };

    document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-prod-id').value;
        const date = document.getElementById('edit-prod-date').value;
        const item_name = document.getElementById('edit-prod-name').value;
        const price = document.getElementById('edit-prod-price').value;

        const { error } = await supabaseClient.from('product_sales').update({
            item_name, price
        }).eq('id', id);

        if (error) {
            alert('Ralat kemaskini jualan: ' + error.message);
        } else {
            closeModal('edit-product-modal');
            loadDateData();
            if (!document.getElementById('report-modal').classList.contains('hidden')) {
                window.fetchReportData();
            }
        }
    });

    // === 9. DELETE BOOKING ===
    window.openBookingDetails = (id) => {
        const b = currentBookings.find(x => x.id === id);
        if(!b) return;

        const pkgName = packagesMap[b.package_id] || 'Pakej Custom';
        const displayTime = formatTime12Hr(b.start_time);

        document.getElementById('bd-content').innerHTML = `
            <div class="mb-4 text-center">
                <div class="text-2xl font-bold text-gold">${b.customer_name}</div>
                <div class="text-sm text-ivory/60 mt-1">${displayTime}</div>
            </div>
            <div class="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span class="text-ivory/50">Telefon</span>
                    <span class="font-semibold">${b.customer_phone || '-'}</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span class="text-ivory/50">Kawasan</span>
                    <span class="font-semibold text-right">${b.details_lokasi_map}</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-2">
                    <span class="text-ivory/50">Pakej</span>
                    <span class="font-semibold text-right">${pkgName}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-ivory/50">Harga (RM)</span>
                    <span class="font-semibold text-gold">${(() => {
                        if (b.bayaran && b.bayaran.length > 0) return (parseFloat(b.bayaran[0].amount_paid || 0) + parseFloat(b.bayaran[0].balance || 0)).toFixed(2);
                        return parseFloat(packagePrices[b.package_id] || 0).toFixed(2);
                    })()}</span>
                </div>
            </div>
        `;
        
        const editBtn = document.getElementById('bd-edit-btn');
        editBtn.classList.remove('hidden');
        editBtn.onclick = () => {
            closeModal('booking-details-modal');
            openEditBookingModal(id);
        };

        const delBtn = document.getElementById('bd-delete-btn');
        delBtn.classList.remove('hidden');
        delBtn.onclick = () => deleteBooking(id);

        openModal('booking-details-modal');
    };

    window.allReportBookings = [];
    window.allReportSales = [];

    window.openEditBookingModal = (id) => {
        let b = currentBookings.find(x => String(x.id) === String(id));
        if(!b && window.allReportBookings) {
            b = window.allReportBookings.find(x => String(x.id) === String(id));
        }
        if(!b) return;

        document.getElementById('edit-booking-id').value = id;
        document.getElementById('edit-date').value = b.date || formatDateStr(selectedDate);
        document.getElementById('edit-time').value = b.start_time || '';
        document.getElementById('edit-name').value = b.customer_name || '';
        document.getElementById('edit-phone').value = b.customer_phone || '';
        document.getElementById('edit-package').value = b.package_id || '';
        
        let customPrice = '';
        let paymentStatus = 'Pending Deposit';
        if (b.bayaran && b.bayaran.length > 0) {
            const total = parseFloat(b.bayaran[0].amount_paid || 0) + parseFloat(b.bayaran[0].balance || 0);
            if (total !== packagePrices[b.package_id]) {
                customPrice = total;
            }
            paymentStatus = b.bayaran[0].status || 'Pending Deposit';
        }
        document.getElementById('edit-custom-price').value = customPrice;
        document.getElementById('edit-payment-status').value = paymentStatus;
        document.getElementById('edit-location').value = b.details_lokasi_map || '';

        openModal('edit-booking-modal');
    };

    window.deleteBooking = async (id) => {
        if(!confirm("Adakah anda pasti ingin membatalkan tempahan ini?")) return;
        
        await supabaseClient.from('bayaran').delete().eq('booking_id', id);
        const { error } = await supabaseClient.from('bookings').delete().eq('id', id);
        
        if (error) {
            alert('Gagal memadam: ' + error.message);
        } else {
            closeModal('booking-details-modal');
            loadDateData();
            if (!document.getElementById('report-modal').classList.contains('hidden')) {
                window.fetchReportData();
            }
        }
    };

    window.deleteSale = async (id) => {
        if(!confirm("Adakah anda pasti ingin memadam rekod jualan ini?")) return;
        const { error } = await supabaseClient.from('product_sales').delete().eq('id', id);
        if (error) {
            alert('Gagal memadam: ' + error.message);
        } else {
            loadDateData();
            if (!document.getElementById('report-modal').classList.contains('hidden')) {
                window.fetchReportData();
            }
        }
    };

    // --- REPORT MODAL LOGIC ---
    window.switchRepTab = (tab) => {
        const btnTempahan = document.getElementById('rep-tab-tempahan');
        const btnJualan = document.getElementById('rep-tab-jualan');
        const viewTempahan = document.getElementById('rep-view-tempahan');
        const viewJualan = document.getElementById('rep-view-jualan');

        if (tab === 'tempahan') {
            btnTempahan.className = 'flex-1 py-4 font-bold text-sm text-gold border-b-2 border-gold transition-colors';
            btnJualan.className = 'flex-1 py-4 font-bold text-sm text-ivory/50 border-b-2 border-transparent transition-colors';
            viewTempahan.classList.remove('hidden');
            viewJualan.classList.add('hidden');
        } else {
            btnJualan.className = 'flex-1 py-4 font-bold text-sm text-gold border-b-2 border-gold transition-colors';
            btnTempahan.className = 'flex-1 py-4 font-bold text-sm text-ivory/50 border-b-2 border-transparent transition-colors';
            viewJualan.classList.remove('hidden');
            viewTempahan.classList.add('hidden');
        }
    };

    window.fetchReportData = async () => {

        const tableT = document.getElementById('rep-table-tempahan');
        const tableJ = document.getElementById('rep-table-jualan');
        
        tableT.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-ivory/50"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Sedang memuatkan...</td></tr>';
        tableJ.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-ivory/50"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Sedang memuatkan...</td></tr>';
        
        let bQuery = supabaseClient
            .from('bookings')
            .select(`
                *,
                bayaran ( amount_paid, balance, status )
            `)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

        let sQuery = supabaseClient
            .from('product_sales')
            .select('*')
            .order('date', { ascending: true });

        const monthFilter = document.getElementById('rep-month-filter') ? document.getElementById('rep-month-filter').value : '';
        if (monthFilter) {
            const year = monthFilter.split('-')[0];
            const month = monthFilter.split('-')[1];
            const lastDay = new Date(year, month, 0).getDate();
            const startStr = `${year}-${month}-01`;
            const endStr = `${year}-${month}-${lastDay}`;
            bQuery = bQuery.gte('date', startStr).lte('date', endStr);
            sQuery = sQuery.gte('date', startStr).lte('date', endStr);
        }

        const { data: bookingsData } = await bQuery;
        window.allReportBookings = bookingsData || [];

        const { data: salesData } = await sQuery;
        window.allReportSales = salesData || [];

        let totalS = 0;
        if (bookingsData && bookingsData.length > 0) {
            let tHtml = '';
            bookingsData.forEach(b => {
                const bayaranObj = (b.bayaran && b.bayaran[0]) || { amount_paid: 0, balance: 0, status: 'Pending Deposit' };
                const paid = parseFloat(bayaranObj.amount_paid || 0);
                const bal = parseFloat(bayaranObj.balance || 0);
                const total_price = paid + bal;
                
                totalS += total_price;
                
                const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
                const dayName = days[new Date(b.date).getDay()];
                const dDate = `${dayName}, ` + new Date(b.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' });
                const dTime = formatTime12Hr(b.start_time);
                const pkgName = packagesMap[b.package_id] || b.package || b.package_id || 'Pakej Custom';
                
                let payBadge = '';
                if (bal === 0 && total_price > 0) {
                    payBadge = '<span class="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">LUNAS</span>';
                } else if (paid > 0) {
                    payBadge = '<span class="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold">DEPOSIT</span>';
                } else {
                    payBadge = '<span class="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">BELUM BAYAR</span>';
                }

                tHtml += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3"><div class="font-bold">${dDate}</div><div class="text-xs text-gold">${dTime}</div></td>
                        <td class="px-4 py-3"><div class="font-bold text-white">${b.name || b.customer_name}</div><div class="text-xs text-ivory/60">${b.phone || b.customer_phone}</div></td>
                        <td class="px-4 py-3 text-xs opacity-90 truncate max-w-[150px]" title="${pkgName}">${pkgName}</td>
                        <td class="px-4 py-3"><div class="font-bold text-white">RM ${total_price.toFixed(2)}</div><div class="mt-1">${payBadge}</div></td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="window.openEditBookingModal('${b.id}')" class="text-gold hover:text-white mx-1 transition-colors" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteBooking('${b.id}')" class="text-red-400 hover:text-red-300 mx-1 transition-colors" title="Batal"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
            tableT.innerHTML = tHtml;
        } else {
            tableT.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-ivory/40">Tiada tempahan direkodkan pada julat tarikh ini.</td></tr>';
        }

        let totalJ = 0;
        if (salesData && salesData.length > 0) {
            let jHtml = '';
            salesData.forEach(s => {
                totalJ += s.price;
                const dDate = new Date(s.date).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' });
                
                jHtml += `
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3 text-xs">${dDate}</td>
                        <td class="px-4 py-3 font-bold text-white">${s.item_name}</td>
                        <td class="px-4 py-3 text-right font-bold text-gold">RM ${s.price.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="window.openEditProductModal('${s.id}')" class="text-gold hover:text-white mx-1 transition-colors" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteSale('${s.id}')" class="text-red-400 hover:text-red-300 mx-1 transition-colors" title="Batal"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
            tableJ.innerHTML = jHtml;
        } else {
            tableJ.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-ivory/40">Tiada jualan direkodkan pada julat tarikh ini.</td></tr>';
        }

        document.getElementById('rep-total-servis').textContent = `RM ${totalS.toFixed(2)}`;
        document.getElementById('rep-total-jualan').textContent = `RM ${totalJ.toFixed(2)}`;
        window.filterReportTable(); // apply search if any
        
        const monthOverlay = document.getElementById('month-overlay');
        if (monthOverlay) {
            monthOverlay.style.display = document.getElementById('rep-month-filter').value ? 'none' : 'flex';
        }
    };

    window.filterReportTable = () => {
        const input = document.getElementById('rep-search').value.toLowerCase();
        
        // Filter Tempahan
        const trsT = document.querySelectorAll('#rep-table-tempahan tr');
        trsT.forEach(tr => {
            if (tr.children.length > 1) {
                const text = tr.innerText.toLowerCase();
                tr.style.display = text.includes(input) ? '' : 'none';
            }
        });

        // Filter Jualan
        const trsJ = document.querySelectorAll('#rep-table-jualan tr');
        trsJ.forEach(tr => {
            if (tr.children.length > 1) {
                const text = tr.innerText.toLowerCase();
                tr.style.display = text.includes(input) ? '' : 'none';
            }
        });
    };

    window.exportToCSV = () => {
        const isTempahan = !document.getElementById('rep-view-tempahan').classList.contains('hidden');
        let csv = [];
        if (isTempahan) {
            csv.push(['Tarikh & Masa', 'Pelanggan', 'Telefon', 'Pakej', 'Bayaran (RM)', 'Status'].join(','));
            window.allReportBookings.forEach(b => {
                const bayaranObj = (b.bayaran && b.bayaran[0]) || { amount_paid: 0, balance: 0, status: 'Pending' };
                const paid = parseFloat(bayaranObj.amount_paid || 0);
                const bal = parseFloat(bayaranObj.balance || 0);
                const total = paid + bal;
                let stat = (bal === 0 && total > 0) ? 'LUNAS' : (paid > 0 ? 'DEPOSIT' : 'BELUM BAYAR');
                csv.push([
                    `"${new Date(b.date).toLocaleDateString('ms-MY')} ${formatTime12Hr(b.start_time)}"`,
                    `"${b.customer_name || ''}"`,
                    `"${b.customer_phone || ''}"`,
                    `"${b.package_id || ''}"`,
                    total.toFixed(2),
                    stat
                ].join(','));
            });
        } else {
            csv.push(['Tarikh', 'Item/Produk', 'Harga (RM)'].join(','));
            window.allReportSales.forEach(s => {
                csv.push([
                    `"${new Date(s.date).toLocaleDateString('ms-MY')}"`,
                    `"${s.item_name}"`,
                    s.price.toFixed(2)
                ].join(','));
            });
        }

        const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_${isTempahan ? 'Tempahan' : 'Jualan'}_NurizmaBridal.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Kickoff
    init();
});
