const SUPABASE_URL = 'https://usgjnipnhihbjyhmgwzu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZ2puaXBuaGloYmp5aG1nd3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTIyOTAsImV4cCI6MjA5NTcyODI5MH0.-kGWcSArTTn-x3Q4dTP29WxHyvDsLi5z1RpKw3i9_9s';

const bookings = [
  { "date": "2026-06-25", "start_time": "17:00:00", "end_time": "18:00:00", "customer_name": "Nurul" },
  { "date": "2026-06-26", "start_time": "17:00:00", "end_time": "18:00:00", "customer_name": "Farhanah" },
  { "date": "2026-06-26", "start_time": "07:00:00", "end_time": "08:00:00", "customer_name": "Yana" },
  { "date": "2026-06-18", "start_time": "20:30:00", "end_time": "21:30:00", "customer_name": "Farah" },
  { "date": "2026-06-19", "start_time": "10:00:00", "end_time": "11:00:00", "customer_name": "Zaty" },
  { "date": "2026-06-18", "start_time": "17:00:00", "end_time": "18:00:00", "customer_name": "Aelisyia" },
  { "date": "2026-06-26", "start_time": "09:00:00", "end_time": "10:00:00", "customer_name": "Aisyah" },
  { "date": "2026-06-19", "start_time": "14:00:00", "end_time": "15:00:00", "customer_name": "Lina (Walk In)" },
  { "date": "2026-06-20", "start_time": "07:00:00", "end_time": "08:00:00", "customer_name": "Alya" },
  { "date": "2026-06-19", "start_time": "20:30:00", "end_time": "21:30:00", "customer_name": "Alieya" },
  { "date": "2026-06-25", "start_time": "10:00:00", "end_time": "11:00:00", "customer_name": "Safira" },
  { "date": "2026-06-26", "start_time": "20:30:00", "end_time": "21:30:00", "customer_name": "Ain" },
  { "date": "2026-06-26", "start_time": "14:00:00", "end_time": "15:00:00", "customer_name": "Qila" },
  { "date": "2026-06-25", "start_time": "20:30:00", "end_time": "21:30:00", "customer_name": "Afifa" },
  { "date": "2026-06-19", "start_time": "17:00:00", "end_time": "18:00:00", "customer_name": "Wanee Family" }
];

async function importData() {
  for (const b of bookings) {
    const payload = {
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      customer_name: b.customer_name,
      customer_phone: '-',
      package_id: null,
      details_lokasi_map: '-'
    };

    console.log(`Inserting booking for ${b.customer_name}...`);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`Failed to insert ${b.customer_name}:`, await res.text());
      continue;
    }

    const data = await res.json();
    const newId = data[0].id;

    const bayaranPayload = {
      booking_id: newId,
      amount_paid: 0,
      balance: 0,
      status: 'Pending Deposit'
    };

    const resBayaran = await fetch(`${SUPABASE_URL}/rest/v1/bayaran`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bayaranPayload)
    });

    if (!resBayaran.ok) {
      console.error(`Failed to insert bayaran for ${b.customer_name}:`, await resBayaran.text());
    } else {
      console.log(`Successfully inserted booking and bayaran for ${b.customer_name}`);
    }
  }
  console.log('All done!');
}

importData().catch(console.error);
