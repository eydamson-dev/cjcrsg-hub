# Troubleshooting

Common issues and solutions for CJCRSG-Hub development.

---

## Quick Fixes

### Issue: Can't start dev server

**Symptom:** `pnpm dev` fails with errors

**Solutions:**

1. Check if ports are in use:

   ```bash
   # Check if port 3000 is free
   lsof -i :3000

   # Check if Convex port is free
   lsof -i :3210
   ```

2. Clear node_modules and reinstall:

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. Check Node.js version:
   ```bash
   node -v  # Should be 18+
   ```

---

## Convex Issues

### Issue: Convex connection errors

**Symptom:** App shows "Failed to connect to Convex" or similar errors

**Causes & Solutions:**

1. **Missing environment variables**
   - Check `.env.local` exists
   - Verify `VITE_CONVEX_URL` is set correctly:
     ```bash
     # For local development
     VITE_CONVEX_URL=http://127.0.0.1:3210
     ```

2. **Convex dev server not running**

   ```bash
   # Start Convex in a separate terminal
   pnpm dlx convex dev
   ```

3. **Port conflicts**
   - Convex uses port 3210 by default
   - Check if something else is using it:
     ```bash
     pnpm dlx convex status
     ```

### Issue: Schema changes not reflecting

**Symptom:** Added new table/index but not showing in queries

**Solution:**

```bash
# Force Convex to regenerate types
pnpm dlx convex dev --once

# Then restart dev server
pnpm dev
```

### Issue: Query returns stale data

**Symptom:** Data not updating after mutation

**Solutions:**

1. Check query key in TanStack Query DevTools
2. Verify mutation invalidates correct query keys
3. Manually refetch:
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['attendees'] })
   ```

---

## Authentication Issues

### Issue: Auth not working / Can't log in

**Symptom:** Login form shows errors or redirects fail

**Causes & Solutions:**

1. **Missing BETTER_AUTH_SECRET**
   - Generate a secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Add to `.env.local`:
     ```
     BETTER_AUTH_SECRET=your-generated-secret
     BETTER_AUTH_URL=http://localhost:3000
     ```

2. **Auth routes not configured**
   - Check `src/routes/api/auth/$.ts` exists
   - Verify `convex/auth.config.ts` is set up
   - Restart dev server after config changes

3. **Session not persisting**
   - Check browser cookies are enabled
   - Verify `BETTER_AUTH_URL` matches your dev URL
   - Clear browser cache and cookies

---

## UI/Component Issues

### Issue: shadcn components not styling

**Symptom:** Components appear unstyled or broken

**Solutions:**

1. **Tailwind CSS v4 not configured**
   - Check `vite.config.ts` has Tailwind plugin:
     ```typescript
     import tailwindcss from '@tailwindcss/vite'
     // ...
     plugins: [tailwindcss(), ...]
     ```

2. **CSS variables not set**
   - Check `src/styles/app.css` has shadcn theme variables
   - Run `pnpm dlx shadcn@canary init` again if needed

3. **Component not installed correctly**
   ```bash
   # Reinstall component
   pnpm dlx shadcn@canary add button --overwrite
   ```

### Issue: Form validation not working

**Symptom:** Form submits without validation or errors don't show

**Solutions:**

1. Ensure `zodResolver` is properly imported:

   ```typescript
   import { zodResolver } from '@hookform/resolvers/zod'
   ```

2. Check that form schema is defined:

   ```typescript
   const form = useForm({
     resolver: zodResolver(attendeeSchema),
   })
   ```

3. Verify error messages are displayed:
   ```typescript
   <FormField
     control={form.control}
     name="email"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Email</FormLabel>
         <Input {...field} />
         <FormMessage />  {/* This shows errors */}
       </FormItem>
     )}
   />
   ```

---

## TypeScript Issues

### Issue: Type errors after schema change

**Symptom:** `dataModel.d.ts` types not updating

**Solution:**

```bash
# Regenerate Convex types
pnpm dlx convex dev --once

# If still failing, restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Import path aliases not working

**Symptom:** `@/components/ui/button` shows error

**Solutions:**

1. Check `tsconfig.json` has paths configured:

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. Restart TypeScript server in IDE

---

## Route/Router Issues

### Issue: Route not found (404)

**Symptom:** Page shows "not found" or "Route not found"

**Causes & Solutions:**

1. **File naming convention**
   - TanStack Router uses file-based routing
   - Check file name matches convention:
     - `index.tsx` → `/`
     - `attendees.index.tsx` → `/attendees`
     - `attendees.$id.tsx` → `/attendees/:id`

2. **Route tree not generated**

   ```bash
   # Regenerate route tree
   pnpm dev

   # Or manually
   npx tsr generate
   ```

3. **Route not registered**
   - Check file is in `src/routes/` directory
   - Verify file exports `Route` component

---

## Build & Deployment Issues

### Issue: Build fails

**Symptom:** `pnpm build` produces errors

**Solutions:**

1. **TypeScript errors**

   ```bash
   # Check for type errors
   pnpm dev:ts

   # Fix all errors before building
   ```

2. **Missing environment variables**
   - Ensure `.env.local` exists (not needed for build, but good to check)
   - Some env vars may need to be public (VITE\_ prefix)

3. **Node version mismatch**
   ```bash
   # Check version
   node -v  # Should be 18+
   ```

### Issue: Deployment to Convex cloud fails

**Symptom:** `pnpm dlx convex deploy` fails

**Solutions:**

1. **Not logged in**

   ```bash
   # Login to Convex
   pnpm dlx convex login
   ```

2. **No deployment selected**

   ```bash
   # List deployments
   pnpm dlx convex deployments list

   # Set deployment
   pnpm dlx convex deployment set
   ```

3. **Schema validation fails**
   - Check that all documents match schema in Convex dashboard
   - Fix or delete non-conforming documents
   - Run `pnpm dlx convex dev --once` first to validate locally

---

## Debug Mode

### Enable Convex Debug Logging

```bash
DEBUG=convex:* pnpm dev
```

This shows detailed logs for:

- Database queries
- Function execution
- WebSocket connections
- Auth flows

### Check Convex Deployment Status

```bash
pnpm dlx convex status
```

Shows:

- Current deployment
- Local vs cloud status
- Connected clients

### View Convex Logs

```bash
# Real-time logs
pnpm dlx convex logs

# Filter by function
pnpm dlx convex logs --function attendees/list
```

---

## Performance Issues

### Issue: App feels slow

**Solutions:**

1. **Check query fetching**
   - Open TanStack Query DevTools
   - Look for excessive refetches
   - Check cache settings

2. **Optimize Convex queries**
   - Add indexes for filtered fields
   - Use `.take()` to limit results
   - Avoid N+1 queries

3. **Check component re-renders**
   - Use React DevTools Profiler
   - Memoize expensive calculations
   - Use `React.memo()` for pure components

---

## Still Stuck?

1. **Check the logs**
   - Browser console (F12)
   - Terminal output
   - Convex dashboard logs

2. **Restart everything**

   ```bash
   # Stop all dev servers
   # Then restart:
   pnpm dlx convex dev  # Terminal 1
   pnpm dev            # Terminal 2
   ```

3. **Ask for help**
   - Check [Convex Discord](https://convex.dev/community)
   - Review [TanStack Start docs](https://tanstack.com/start/latest)
   - Look at [shadcn/ui docs](https://ui.shadcn.com)

---

_Last Updated: 2026-03-20_
