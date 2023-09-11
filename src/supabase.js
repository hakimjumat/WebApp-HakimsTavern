import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hziurjsjxpmvzpxrkpui.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aXVyanNqeHBtdnpweHJrcHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM4ODE1MjksImV4cCI6MjAwOTQ1NzUyOX0.bYtEtTBdLmiVmx3YjSDGER6t7gGp4EzHxcnlEV-l4Sk";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
