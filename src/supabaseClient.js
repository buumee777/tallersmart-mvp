import { createClient } from '@supabase/supabase-js';
export const supabaseUrl = 'https://iqdcvznigerljqwwtlvs.supabase.co';
export const supabaseAnonKey = 'sb_publishable_n08oiA1Cgg4ld42rjo4hPA_8upfmOmj';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
