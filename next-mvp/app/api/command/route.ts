import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getOpenAI } from "../../../lib/server";
import { agents, routeAgents } from "../../../lib/agents";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const db = getSupabase();
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    const input: unknown = await req.json();
    if (!input || typeof input !== "object") return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    const command = (input as Record<string, unknown>).command;
    if (typeof command !== "string" || command.trim().length < 5 || command.length > 2000) return NextResponse.json({ error: "Command must be 5-2000 characters" }, { status: 400 });
    const ai = getOpenAI();
    // This uses the user's JWT so Supabase RLS applies on writes.
    const userDb = createUserClient(token);
    const { data: run, error: runError } = await userDb.from("runs").insert({ user_id: auth.user.id, command: command.trim(), status: "working" }).select("id").single();
    if (runError || !run) return NextResponse.json({ error: "Could not create run" }, { status: 500 });
    const selected = routeAgents(command);
    try {
      const results = await Promise.all(selected.map(async agent => {
        const answer = await ai.responses.create({model:process.env.OPENAI_MODEL || "gpt-4.1-mini", instructions: agent.instruction + "\nRespond in Thai.", input: command.trim(), max_output_tokens: 900});
        const output = answer.output_text || "No output returned";
        const { error } = await userDb.from("agent_outputs").insert({ run_id: run.id, user_id: auth.user.id, agent_id: agent.id, content: output });
        if(error) throw new Error("Could not save output");
        return { agent:agent.name, role:agent.role, output };
      }));
      const manager = agents[0];
      const combined = await ai.responses.create({model:process.env.OPENAI_MODEL || "gpt-4.1-mini", instructions:manager.instruction + "\nWrite in Thai. Present an executive summary and explicit recommended approval decision. Never claim any external action was taken.", input:JSON.stringify({command,results}), max_output_tokens:1400});
      const summary = combined.output_text || "No summary returned";
      const { error: savedError } = await userDb.from("runs").update({ status:"waiting_approval", summary }).eq("id",run.id);
      if(savedError) throw new Error("Could not save summary");
      return NextResponse.json({runId:run.id,status:"waiting_approval",agents:results,summary});
    } catch {
      await userDb.from("runs").update({ status:"failed" }).eq("id",run.id);
      return NextResponse.json({runId:run.id,error:"Agent run failed. See your server logs.",status:"failed"}, {status:500});
    }
  } catch { return NextResponse.json({error:"Service unavailable. Check server configuration."},{status:503}); }
}
function createUserClient(jwt:string) {
 const {createClient}=require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:`Bearer ${jwt}`}},auth:{persistSession:false,autoRefreshToken:false}});
}
