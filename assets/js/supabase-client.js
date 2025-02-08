const SUPABASE_URL = 'https://tejxhpolghqoudmldqnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlanhocG9sZ2hxb3VkbWxkcW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTMwNTksImV4cCI6MjA1NDI2OTA1OX0.IrCv-9pCAJ4AUqsvYVNkxogP7xkvY4iSRfNCrxz9WfA';

// Initialize the Supabase client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verify initialization
if (!window.supabaseClient) {
    console.error('Failed to initialize Supabase client');
} else {
    console.log('Supabase client initialized successfully');
} 