# Agent Guidelines & Rules

## Project Integrity & Deployment
- **CRITICAL**: Do NOT modify, regenerate, or overwrite the `.github/workflows/deploy.yml` file under any circumstances unless explicitly requested by the user. This file contains custom manual configuration (`env:` variables) that injects production Supabase secrets during the build phase. Overwriting it will break the production site's cloud data connection.
- **CRITICAL**: Do NOT modify, regenerate, or overwrite the `src/lib/supabaseSync.ts` file under any circumstances unless explicitly requested by the user. This file contains a critical, manually verified `redirectTo` path for Supabase OAuth sign-in (`window.location.origin + '/prime-life/'`) that ensures redirects route to the correct subfolder under production builds. Modifying or replacing this file will break authentication for live users.
