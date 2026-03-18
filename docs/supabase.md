# Connect with Vercel
1. Create a Supabase database table
2. Use the create-next-app command and the with-supabase template, to create a Next.js app pre-configured with: 
3. Start by connecting to your existing project and then run vercel link in the CLI to link to the project locally.
4. Run vercel env pull .env.development.local to make the latest environment variables available to your project locally.
5. Create a new file at app/notes/page.tsx and populate with the following.
   ```
import { createClient } from '@/utils/supabase/server';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
   ```