import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbmmoecmjuznztkbqtyf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SsDZeyr6fA69dOC9t9Xyxg_slYBlmE4';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_CLIENT_CONFIG = {
  projectId: 'bbmmoecmjuznztkbqtyf',
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};
