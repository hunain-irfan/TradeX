# Supabase setup (run in order)

1. `phase5-schema.sql` — tables, RLS, new-user trigger
2. `fix-user-trigger.sql` — fix wallet creation on signup (if user create failed)
3. `phase10-leaderboard.sql` — leaderboard RPC
4. `phase11-admin-rpc.sql` — admin RPC functions

After signup, promote admin:

```sql
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"admin","is_banned":false,"is_frozen":false}'::jsonb
WHERE email = 'your-email@example.com';
```

Then sign out and sign in again in the app.
