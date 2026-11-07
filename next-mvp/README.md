# FERN AI OFFICE — Real Agent Foundation (separate app)

This directory contains an **unreleased Next.js MVP foundation**. It does not replace the public demo `index.html` until you explicitly deploy this directory as its own Vercel project. The agents use real server-side OpenAI API calls; responses are saved in Supabase with row-level security.

## Setup
1. In Supabase, create the project and enable email/password Auth. Create an authorized account under Authentication.
2. Run `supabase/schema.sql` in Supabase SQL Editor. **This schema is intended for a fresh project**; if your tables already exist, review policies before applying.
3. Copy `.env.example` to `.env.local` and fill in the Supabase public URL/key, plus server-side `OPENAI_API_KEY`. NEVER commit `.env.local`.
4. Run `npm install`, `npm run typecheck`, `npm run build`, then `npm run dev` in this directory.
5. Deploy on a **separate Vercel project**, setting Root Directory to `next-mvp`. Add the same environment variables in Vercel project settings, then deploy.
6. Sign in with a Supabase Auth email/password user. Give Astra a command, inspect the report, then choose approve/revise/reject.

## Explicit limitations
- This stage is a secure web dashboard + server-side agents, **not yet a working 3D office**. The prior 2.5D demo remains in repository root.
- Astra routes to 1–4 specialist agents using deterministic keyword rules; it does not execute third-party actions.
- Agent outputs are language-model generated, not automatically verified facts.
- Approval controls update task statuses only; they do NOT send emails or run workflows.
- Authentication uses Supabase Auth and RLS; never expose server secret API keys.
- A single serverless call may hit execution duration or AI spend limits; long-running jobs will need an asynchronous queue in a later stage.
- Rate limits, per-user budgets and organization-level RBAC are **required before broader production use**.

## Architecture
Browser → Supabase Auth → POST /api/command (Bearer JWT) → verify JWT → route 1–4 specialists → OpenAI Responses → Supabase RLS persistence → Astra summary → human approval.
