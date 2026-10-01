import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'recipes',
  'recipe_ingredients',
  'recipe_utensils',
  'recipe_steps',
  'recipe_tips',
  'ingredient_guide',
  'techniques',
  'measures_guide',
  'shopping_lists',
  'calendar_days',
  'profiles',
  'favorites',
  'tags',
  'recipe_tags',
  'subscriptions'
];

async function audit() {
  console.log('Auditing tables in Supabase...');
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table "${table}": ERROR -> ${error.message} (code: ${error.code})`);
      } else {
        console.log(`Table "${table}": OK (rows accessible: ${data.length})`);
      }
    } catch (err: any) {
      console.log(`Table "${table}": EXCEPTION -> ${err.message}`);
    }
  }
}

audit();
