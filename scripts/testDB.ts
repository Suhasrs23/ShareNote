import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Querying entries...');
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  fs.writeFileSync(path.join(__dirname, 'entries_dump.json'), JSON.stringify(data, null, 2));
  console.log('Saved to entries_dump.json');
}

check();
