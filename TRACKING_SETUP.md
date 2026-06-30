# Portfolio visit tracking

## 1. Supabase

1. Create a Supabase project.
2. Open the SQL editor.
3. Copy and run `supabase/schema.sql`.
4. Open Project Settings > API and keep these values ready:
   - Project URL
   - `service_role` key

## 2. Vercel environment variables

Add these variables in Vercel > Project > Settings > Environment Variables:

```txt
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_TOKEN=a_private_password_or_token_for_admin_html
IP_HASH_SECRET=a_long_random_secret_for_ip_hashing
TRACK_STORE_RAW_IP=false
```

Set `TRACK_STORE_RAW_IP=true` only if you explicitly want to store exact IP addresses.
For privacy, the safer default is `false`, which stores a masked IP and a private hash.

## 3. Admin

After deployment, open:

```txt
https://your-domain/admin.html
```

Use the value of `ADMIN_TOKEN` to unlock the private dashboard.
