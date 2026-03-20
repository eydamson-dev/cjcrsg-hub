# Common Tasks - How To Guides

Step-by-step guides for common development tasks.

---

## How to Create a New Feature Module

### Step-by-Step

1. **Create folder structure**

   ```bash
   mkdir -p src/features/feature-name/{components,hooks,routes}
   touch src/features/feature-name/types.ts
   ```

2. **Define types in `types.ts`**

   ```typescript
   export interface FeatureItem {
     _id: string
     name: string
     description?: string
     createdAt: number
     updatedAt: number
   }

   export type FeatureStatus = 'active' | 'inactive'
   ```

3. **Create Convex queries in `convex/feature-name/queries.ts`**

   ```typescript
   import { query } from './_generated/server'
   import { v } from 'convex/values'
   import { paginationOptsValidator } from 'convex/server'

   export const list = query({
     args: { paginationOpts: paginationOptsValidator },
     handler: async (ctx, args) => {
       return await ctx.db
         .query('feature_items')
         .order('desc')
         .paginate(args.paginationOpts)
     },
   })

   export const getById = query({
     args: { id: v.id('feature_items') },
     handler: async (ctx, args) => {
       return await ctx.db.get(args.id)
     },
   })
   ```

4. **Create Convex mutations in `convex/feature-name/mutations.ts`**

   ```typescript
   import { mutation } from './_generated/server'
   import { v } from 'convex/values'

   export const create = mutation({
     args: {
       name: v.string(),
       description: v.optional(v.string()),
     },
     handler: async (ctx, args) => {
       const now = Date.now()
       const id = await ctx.db.insert('feature_items', {
         ...args,
         createdAt: now,
         updatedAt: now,
       })
       return id
     },
   })

   export const update = mutation({
     args: {
       id: v.id('feature_items'),
       name: v.optional(v.string()),
       description: v.optional(v.string()),
     },
     handler: async (ctx, args) => {
       const { id, ...updates } = args
       await ctx.db.patch(id, {
         ...updates,
         updatedAt: Date.now(),
       })
     },
   })
   ```

5. **Create list component in `src/features/feature-name/components/FeatureList.tsx`**

   ```typescript
   import { useSuspenseQuery } from '@tanstack/react-query';
   import { convexQuery } from '@convex-dev/react-query';
   import { api } from '../../../../convex/_generated/api';

   export function FeatureList() {
     const { data } = useSuspenseQuery(
       convexQuery(api.featureName.list, { count: 10 })
     );

     return (
       <div>
         {data.map((item) => (
           <div key={item._id}>{item.name}</div>
         ))}
       </div>
     );
   }
   ```

6. **Create form component in `src/features/feature-name/components/FeatureForm.tsx`**
   - Use react-hook-form + zod
   - Add validation
   - Handle submission with mutation

7. **Create routes in `src/features/feature-name/routes/`**
   - `feature-name.index.tsx` - List view
   - `feature-name.new.tsx` - Create form
   - `feature-name.$id.tsx` - Detail view
   - `feature-name.$id.edit.tsx` - Edit form

8. **Add to navigation in `Layout.tsx`**
   - Add new menu item
   - Use appropriate icon
   - Link to route

9. **Update database schema in `convex/schema.ts`**

   ```typescript
   feature_items: defineTable({
     name: v.string(),
     description: v.optional(v.string()),
     createdAt: v.number(),
     updatedAt: v.number(),
   })
     .index('by_name', ['name']),
   ```

10. **Generate types**

    ```bash
    pnpm dlx convex dev --once
    ```

11. **Test the feature**
    - Run `pnpm dev`
    - Navigate to routes
    - Test CRUD operations

---

## How to Add a Convex Query

### 1. Create File

```bash
touch convex/feature-name/queries.ts
```

### 2. Write Query

```typescript
import { query } from '../_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tableName')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})
```

### 3. Export from `convex/_generated/api.ts` (auto-generated)

Just run:

```bash
pnpm dlx convex dev --once
```

### 4. Use in Frontend

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '../../convex/_generated/api';

function MyComponent() {
  const { data } = useSuspenseQuery(
    convexQuery(api.featureName.list, { count: 10 })
  );

  return <div>{data.page.map(item => item.name)}</div>;
}
```

---

## How to Create a Form

### 1. Define Zod Schema

```typescript
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  status: z.enum(['member', 'visitor', 'inactive']),
})

type FormData = z.infer<typeof formSchema>
```

### 2. Create Form Component

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'visitor',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createItem(data);
      toast.success('Created successfully');
    } catch (error) {
      toast.error('Failed to create');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

### 3. Handle Submission

- Call Convex mutation
- Show success/error toast
- Redirect on success

---

## How to Add a New Route

### 1. Create Route File

```bash
touch src/routes/route-name.tsx
```

### 2. Export Route Component

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/route-name')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    // Optional: Check auth, load data
    const { isAuthenticated } = context;
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

function RouteComponent() {
  return <div>Route Content</div>;
}
```

### 3. Route Automatically Registered

TanStack Router automatically registers the route based on file location.

### 4. Test Route

Navigate to `http://localhost:3000/route-name`

---

## How to Add shadcn Component

### Option 1: Use MCP (if configured)

Ask the AI assistant to add the component via MCP.

### Option 2: CLI

```bash
# Add single component
pnpm dlx shadcn@canary add button

# Add multiple components
pnpm dlx shadcn@canary add card input form dialog

# Add with overwrite (reinstall)
pnpm dlx shadcn@canary add button --overwrite
```

### Import and Use

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

---

## How to Test Changes

### Manual Testing

1. **Start dev server**

   ```bash
   pnpm dev
   ```

2. **Test in browser**
   - Open `http://localhost:3000`
   - Navigate to affected routes
   - Test all interactions

3. **Check console**
   - Look for errors
   - Check network requests
   - Verify Convex queries

4. **Test responsive**
   - Resize browser
   - Use DevTools mobile view
   - Test touch interactions

5. **Run quality checks**
   ```bash
   pnpm lint
   pnpm dev:ts
   ```

### Testing Checklist

- [ ] UI renders correctly
- [ ] No console errors
- [ ] Forms validate properly
- [ ] Navigation works
- [ ] Mobile layout works
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Data persists (Convex)
- [ ] Auth works (if applicable)

---

## How to Add a Table

### 1. Install Table Component

```bash
pnpm dlx shadcn@canary add table
```

### 2. Create Table Component

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function DataTable({ data }: { data: Item[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Badge>{item.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## How to Add Toast Notifications

### 1. Install

```bash
pnpm dlx shadcn@canary add toast
# This installs sonner
```

### 2. Add Provider in Root

```typescript
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}
```

### 3. Use in Components

```typescript
import { toast } from 'sonner'

// Success
toast.success('Attendee created')

// Error
toast.error('Failed to create attendee')

// Loading
toast.loading('Creating...')

// Promise
toast.promise(createAttendee(data), {
  loading: 'Creating...',
  success: 'Created successfully',
  error: 'Failed to create',
})
```

---

## How to Handle Authentication

### Check Auth in Component

```typescript
import { useAuth } from '@convex-dev/auth/react';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Login />;

  return <ProtectedContent />;
}
```

### Protect Route

```typescript
export const Route = createFileRoute('/protected')({
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: ProtectedComponent,
})
```

### Protected Query

```typescript
export const getSecretData = query({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserId()
    if (!userId) throw new Error('Not authenticated')
    // ... return data
  },
})
```

---

## How to Debug

### Check Convex Dashboard

```bash
pnpm dlx convex dashboard
```

- View data
- Test queries
- Check logs

### Debug Logging

```bash
DEBUG=convex:* pnpm dev
```

### Console Debugging

```typescript
// In component
console.log('Data:', data)

// In Convex function
export const debugQuery = query({
  handler: async (ctx) => {
    const items = await ctx.db.query('items').collect()
    console.log('Items:', items)
    return items
  },
})
```

### React DevTools

- Install browser extension
- Inspect component tree
- Check props and state
- Profile performance

---

_Last Updated: 2026-03-20_
