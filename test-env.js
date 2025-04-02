// Testing environment variables
require('dotenv').config();

console.log("Environment variables test:");
console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", process.env.VITE_SUPABASE_ANON_KEY ? "Found (not showing for security)" : "Not found");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Found (not showing for security)" : "Not found");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "Found (not showing for security)" : "Not found"); 