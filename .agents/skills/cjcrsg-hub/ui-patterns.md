# UI Patterns & shadcn/ui Usage

## Component Selection Guide

### Layout

| Component   | Use For                        | shadcn Command                         |
| ----------- | ------------------------------ | -------------------------------------- |
| `Card`      | Content containers             | `pnpm dlx shadcn@canary add card`      |
| `Separator` | Visual dividers                | `pnpm dlx shadcn@canary add separator` |
| `Tabs`      | Content organization           | `pnpm dlx shadcn@canary add tabs`      |
| `Sheet`     | Mobile navigation, side panels | `pnpm dlx shadcn@canary add sheet`     |
| `Sidebar`   | Desktop navigation             | `pnpm dlx shadcn@canary add sidebar`   |
| `Resizable` | Resizable panels               | `pnpm dlx shadcn@canary add resizable` |

### Forms

| Component    | Use For                      | shadcn Command                           |
| ------------ | ---------------------------- | ---------------------------------------- |
| `Form`       | Form wrapper with validation | `pnpm dlx shadcn@canary add form`        |
| `Input`      | Text inputs                  | `pnpm dlx shadcn@canary add input`       |
| `Label`      | Form labels                  | `pnpm dlx shadcn@canary add label`       |
| `Select`     | Dropdowns                    | `pnpm dlx shadcn@canary add select`      |
| `DatePicker` | Date selection               | `pnpm dlx shadcn@canary add date-picker` |
| `Textarea`   | Multi-line text              | `pnpm dlx shadcn@canary add textarea`    |
| `Checkbox`   | Boolean options              | `pnpm dlx shadcn@canary add checkbox`    |
| `RadioGroup` | Single selection             | `pnpm dlx shadcn@canary add radio-group` |
| `Switch`     | Toggle switches              | `pnpm dlx shadcn@canary add switch`      |
| `Combobox`   | Searchable dropdowns         | `pnpm dlx shadcn@canary add combobox`    |

### Actions

| Component      | Use For              | shadcn Command                             |
| -------------- | -------------------- | ------------------------------------------ |
| `Button`       | Primary actions      | `pnpm dlx shadcn@canary add button`        |
| `Dialog`       | Modal dialogs        | `pnpm dlx shadcn@canary add dialog`        |
| `DropdownMenu` | Context menus        | `pnpm dlx shadcn@canary add dropdown-menu` |
| `AlertDialog`  | Confirmation dialogs | `pnpm dlx shadcn@canary add alert-dialog`  |
| `Drawer`       | Slide-out panels     | `pnpm dlx shadcn@canary add drawer`        |

### Data Display

| Component   | Use For            | shadcn Command                          |
| ----------- | ------------------ | --------------------------------------- |
| `Table`     | Data tables        | `pnpm dlx shadcn@canary add table`      |
| `Badge`     | Status indicators  | `pnpm dlx shadcn@canary add badge`      |
| `Avatar`    | User images        | `pnpm dlx shadcn@canary add avatar`     |
| `Skeleton`  | Loading states     | `pnpm dlx shadcn@canary add skeleton`   |
| `DataTable` | Advanced tables    | `pnpm dlx shadcn@canary add data-table` |
| `Empty`     | Empty states       | `pnpm dlx shadcn@canary add empty`      |
| `Kbd`       | Keyboard shortcuts | `pnpm dlx shadcn@canary add kbd`        |

### Feedback

| Component  | Use For               | shadcn Command                                   |
| ---------- | --------------------- | ------------------------------------------------ |
| `Toast`    | Notifications         | `pnpm dlx shadcn@canary add toast` (uses sonner) |
| `Progress` | Progress bars         | `pnpm dlx shadcn@canary add progress`            |
| `Alert`    | Warning/info messages | `pnpm dlx shadcn@canary add alert`               |
| `Spinner`  | Loading indicators    | `pnpm dlx shadcn@canary add spinner`             |

### Navigation

| Component        | Use For          | shadcn Command                               |
| ---------------- | ---------------- | -------------------------------------------- |
| `Breadcrumb`     | Navigation paths | `pnpm dlx shadcn@canary add breadcrumb`      |
| `NavigationMenu` | Top navigation   | `pnpm dlx shadcn@canary add navigation-menu` |
| `Pagination`     | Page navigation  | `pnpm dlx shadcn@canary add pagination`      |
| `Command`        | Command palette  | `pnpm dlx shadcn@canary add command`         |
| `Menubar`        | Application menu | `pnpm dlx shadcn@canary add menubar`         |

---

## New Component Examples

### Empty State Component

```typescript
import { Empty } from '@/components/ui/empty';
import { Users } from 'lucide-react';

export function NoAttendees() {
  return (
    <Empty
      title="No attendees yet"
      description="Get started by adding your first church member or visitor."
      icon={Users}
      action={{
        label: 'Add Attendee',
        onClick: () => navigate('/attendees/new'),
      }}
    />
  );
}
```

### Spinner Component

```typescript
import { Spinner } from '@/components/ui/spinner';

// Button with loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>

// Page loading
<div className="flex items-center justify-center h-screen">
  <Spinner size="lg" />
</div>
```

### Kbd (Keyboard Shortcut) Component

```typescript
import { Kbd } from '@/components/ui/kbd';

// In help dialog or tooltips
<p>
  Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open search
</p>

// Shortcut list
<div className="space-y-2">
  <div className="flex justify-between">
    <span>Save</span>
    <div className="space-x-1">
      <Kbd>Ctrl</Kbd>
      <Kbd>S</Kbd>
    </div>
  </div>
</div>
```

### Field Component (Form Composition)

```typescript
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';

export function AttendeeForm() {
  return (
    <Field name="email">
      <FieldLabel>Email Address</FieldLabel>
      <Input type="email" placeholder="john@example.com" />
      <FieldDescription>
        We'll never share your email with anyone.
      </FieldDescription>
      <FieldError />
    </Field>
  );
}
```

---

## Form Pattern Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const attendeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  status: z.enum(['member', 'visitor', 'inactive']),
});

type AttendeeFormData = z.infer<typeof attendeeSchema>;

export function AttendeeForm() {
  const form = useForm<AttendeeFormData>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'visitor',
    },
  });

  const onSubmit = async (data: AttendeeFormData) => {
    try {
      await createAttendee(data);
      toast.success('Attendee created successfully');
      navigate('/attendees');
    } catch (error) {
      toast.error('Failed to create attendee');
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/attendees')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Data Table Pattern

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
import { Button } from '@/components/ui/button';

export function AttendeeTable({ attendees }: { attendees: Attendee[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'member': return 'bg-green-500';
      case 'visitor': return 'bg-blue-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees.map((attendee) => (
            <TableRow key={attendee._id}>
              <TableCell className="font-medium">
                {attendee.firstName} {attendee.lastName}
              </TableCell>
              <TableCell>{attendee.email || '-'}</TableCell>
              <TableCell>{attendee.phone || '-'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(attendee.status)}>
                  {attendee.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/attendees/${attendee._id}`}>View</Link>
                </Button>
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

## Color Coding for Events

| Event Type     | Color        | Tailwind Class  | Hex     |
| -------------- | ------------ | --------------- | ------- |
| Sunday Service | Blue         | `bg-blue-500`   | #3b82f6 |
| Retreat        | Green        | `bg-green-500`  | #22c55e |
| Youth Events   | Purple       | `bg-purple-500` | #8b5cf6 |
| Prayer Meeting | Orange       | `bg-orange-500` | #f97316 |
| Custom types   | User-defined | -               | -       |

Usage:

```typescript
const getEventColor = (eventType: string) => {
  const colors: Record<string, string> = {
    sunday_service: 'bg-blue-500',
    retreat: 'bg-green-500',
    youth: 'bg-purple-500',
    prayer: 'bg-orange-500',
  }
  return colors[eventType] || 'bg-gray-500'
}
```

---

## Responsive Design Patterns

### Mobile-First Approach

```typescript
// Base styles (mobile)
// Tablet (768px+)
// Desktop (1024px+)

<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Responsive text */}
</div>
```

### Mobile Navigation

```typescript
// Desktop: Sidebar
// Mobile: Sheet (drawer)

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <NavigationLinks />
      </SheetContent>
    </Sheet>
  );
}
```

### Responsive Tables

```typescript
<div className="overflow-x-auto">
  <Table>
    {/* Table content */}
  </Table>
</div>
```

---

## Toast Notifications

Install first:

```bash
pnpm dlx shadcn@canary add toast
# This installs sonner automatically
```

Add provider in root:

```typescript
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      {/* Your app */}
      <Toaster />
    </>
  );
}
```

Usage:

```typescript
import { toast } from 'sonner'

// Success
toast.success('Attendee created successfully')

// Error
toast.error('Failed to create attendee')

// Loading
toast.loading('Creating attendee...')

// Custom
toast('Event has been created', {
  description: 'Sunday, December 03, 2023 at 9:00 AM',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
})
```

---

## Dialog Pattern

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateAttendeeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Attendee</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Attendee</DialogTitle>
          <DialogDescription>
            Add a new church member or visitor.
          </DialogDescription>
        </DialogHeader>
        <AttendeeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
```

---

## Loading States

### Skeleton Pattern

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function AttendeeCardSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function AttendeeListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <AttendeeCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### Button Loading

```typescript
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
```

---

## Registry System

shadcn/ui now supports custom component registries for reusable components across projects:

```bash
# Add from a custom registry
pnpm dlx shadcn@canary add @mycompany/analytics

# Create your own registry
# See: https://ui.shadcn.com/docs/registry
```

---

## Best Practices

1. **Use shadcn components** - Don't reinvent the wheel
2. **Customize via Tailwind** - Use `className` prop
3. **Consistent spacing** - Use Tailwind spacing scale
4. **Form validation** - Always validate with Zod
5. **Error states** - Show clear error messages
6. **Loading states** - Never leave users guessing
7. **Mobile-first** - Test on mobile early
8. **Accessibility** - Use proper ARIA labels
9. **Theme colors** - Use `bg-primary`, `text-primary`, etc.
10. **Icons** - Use Lucide React icons
11. **Empty states** - Always provide Empty component for no data
12. **Keyboard shortcuts** - Document with Kbd component

---

_Last Updated: 2026-03-21_
