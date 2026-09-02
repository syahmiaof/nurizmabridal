const SUPABASE_URL = 'https://usgjnipnhihbjyhmgwzu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZ2puaXBuaGloYmp5aG1nd3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTIyOTAsImV4cCI6MjA5NTcyODI5MH0.-kGWcSArTTn-x3Q4dTP29WxHyvDsLi5z1RpKw3i9_9s';

// Initialize the Supabase client safely without shadowing the global CDN object
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});
