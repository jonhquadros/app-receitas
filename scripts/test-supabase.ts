import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
      console.log('Supabase query error on recipes table:', error.message, error.details, error.hint);
    } else {
      console.log('Successfully connected! Recipes found:', data?.length);
      console.log('Recipes data:', JSON.stringify(data, null, 2));
    }

    const { data: ingData, error: ingError } = await supabase.from('recipe_ingredients').select('*');
    if (ingError) {
      console.log('Supabase query error on recipe_ingredients:', ingError.message);
    } else {
      console.log('Recipe ingredients count:', ingData?.length);
    }
  } catch (err: any) {
    console.error('Connection test threw exception:', err.message);
  }
}

testConnection();
