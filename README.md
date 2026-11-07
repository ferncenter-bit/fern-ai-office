# FERN AI OFFICE

Luxury Muji AI Office — browser-based **2.5D demo preview**.

## Current state
- Interactive office diagram with seven selectable placeholder agents
- CEO command input, local simulated task queue, approval/revise/reject controls
- **No real agent execution**, no OpenAI API connection, no Supabase database, no authentication, and no semi-realistic 3D characters
- Demonstration task data is stored in the browser only

## Deployment to Vercel
1. In Vercel select **Add New → Project**.
2. Import GitHub repository `ferncenter-bit/fern-ai-office`.
3. Set Framework Preset to **Other** and Root Directory to `./`.
4. Deploy. There are no environment variables for this static prototype.

**Do not add API keys to the code, and do not enter sensitive company data into the public demo.**

## Next iteration
- Next.js interface and interactive React Three Fiber office
- Semi-realistic licensed character assets
- Supabase persistence and proper authentication
- OpenAI multi-agent orchestration on the server
- Audited human approval before any external action
