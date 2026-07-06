# Agent Guidelines & Rules

## Project Integrity & Deployment
- **CRITICAL**: Do NOT modify, regenerate, or overwrite the `.github/workflows/deploy.yml` file under any circumstances unless explicitly requested by the user. This file contains custom manual configuration (`env:` variables) that injects production Supabase secrets during the build phase. Overwriting it will break the production site's cloud data connection.
