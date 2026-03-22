import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bmwlwbydwlrpoyfawltm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtd2x3Ynlkd2xycG95ZmF3bHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODEzMzksImV4cCI6MjA4OTU1NzMzOX0.qWAu_lpKG5Fk8YU2tblaP88g4OKOhZMO71APf7dE_ao"

export const supabase = createClient(supabaseUrl, supabaseKey)