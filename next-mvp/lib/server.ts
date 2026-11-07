import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export function getSupabase() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!url || !key) throw new Error("Supabase is not configured");
 return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function getOpenAI() {
 if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API is not configured");
 return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 1 });
}
