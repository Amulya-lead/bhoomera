# BHOOMERA

Premium React real-estate platform with Supabase authentication, PostgreSQL data, storage-ready listing architecture and an Express username-resolution service.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and add your project URL, anon key and service-role key.
4. Install and run:

```powershell
npm install
npm run dev
npm run server
```

## Supabase configuration

Enable email confirmation in Supabase Authentication settings. Configure site URL and redirect URLs. Never expose the service-role key in frontend code.

The frontend uses database records once Supabase is configured. Until then it displays clearly separate development presentation data and reports that authentication is not configured.

## Build

```powershell
npm run build
```
