# Testing Strategy

Complete testing guide for CJCRSG-Hub.

---

## Manual Testing Checklist

Use this checklist before marking any phase as complete.

### Authentication

- [ ] Sign up new user with email/password
- [ ] Sign in with valid credentials
- [ ] Sign in with invalid credentials shows error
- [ ] Access protected routes while authenticated
- [ ] Attempt to access protected routes while logged out (should redirect)
- [ ] Sign out
- [ ] Session persists after page refresh
- [ ] Non-existent user sign-in shows appropriate error

### Attendee Management

- [ ] Create new attendee with all fields
- [ ] Create attendee with minimal fields (name only)
- [ ] Edit existing attendee
- [ ] Archive/deactivate attendee
- [ ] View attendee list
- [ ] Search attendees by name
- [ ] Search attendees by email
- [ ] Search attendees by phone
- [ ] Filter attendees by status (member/visitor/inactive)
- [ ] Sort attendees by name
- [ ] Sort attendees by join date
- [ ] View individual attendee profile
- [ ] Pagination works for large lists
- [ ] Form validation shows errors for invalid inputs

### Event Types (Admin)

- [ ] Create new event type with color
- [ ] Edit event type
- [ ] Toggle event type active/inactive
- [ ] View event type list
- [ ] Color displays correctly in UI
- [ ] Only admins can modify event types

### Event Management

- [ ] Create new event
- [ ] Edit existing event
- [ ] Cancel/delete event
- [ ] View upcoming events
- [ ] View past events
- [ ] Filter events by type
- [ ] Sort events by date
- [ ] Event displays correct date and time
- [ ] Event detail page shows all information
- [ ] Cannot create event in the past

### Attendance Tracking

- [ ] Record attendance for an event
- [ ] Search attendee during check-in
- [ ] Quick check-in functionality works
- [ ] View attendance list updates in real-time
- [ ] Uncheck/remove attendance record
- [ ] Bulk check-in multiple attendees
- [ ] Attendance count displays correctly
- [ ] Export attendance to CSV
- [ ] Print-friendly attendance view

### Dashboard

- [ ] Dashboard loads with all widgets
- [ ] Stats display correct numbers
- [ ] Recent attendance widget updates
- [ ] Upcoming events widget shows correct events
- [ ] Click on widget navigates to correct page
- [ ] Dashboard responsive on mobile

### UI/UX

- [ ] Responsive design works on mobile (375px)
- [ ] Responsive design works on tablet (768px)
- [ ] Responsive design works on desktop (1024px+)
- [ ] Navigation works on touch devices
- [ ] Tables scrollable horizontally on mobile
- [ ] Forms usable with mobile keyboards
- [ ] Toast notifications appear correctly
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Empty states display properly
- [ ] Dark mode (if implemented)

---

## Testing Tools

### Browser DevTools

- **Network Tab**: Monitor Convex API calls
- **Console**: Check for JavaScript errors
- **Application**: Inspect cookies, localStorage
- **Performance**: Profile page load times

### Convex Dashboard

- URL: `https://dashboard.convex.dev` (cloud) or local dashboard
- **Data**: Inspect database records
- **Functions**: Test queries and mutations
- **Logs**: View function logs
- **Auth**: Check user sessions

### React DevTools

- Install browser extension
- Inspect component hierarchy
- Check props and state
- Profile component renders

### TanStack Query DevTools

- Automatic in development mode
- Inspect query cache
- View query status (loading, error, success)
- Trigger refetches
- Check query keys

---

## Phase-by-Phase Testing

### Phase 1: Foundation

1. Start dev server: `pnpm dev`
2. Verify app loads without errors
3. Check that navigation renders
4. Test responsive layout (resize browser)
5. Verify auth redirects work

### Phase 2: Database & Auth

1. Check Convex dashboard shows tables
2. Test all auth flows
3. Verify protected routes work
4. Check TypeScript types are generated

### Phase 3: Attendees

1. Create 10+ test attendees
2. Test all CRUD operations
3. Verify search finds correct results
4. Check filters and sorting
5. Test form validation thoroughly

### Phase 4: Event Types

1. Create 3-5 event types
2. Verify colors display correctly
3. Test that types appear in event creation

### Phase 5: Events

1. Create events for each type
2. Test upcoming vs past filtering
3. Verify date/time display correctly
4. Check attendance count shows

### Phase 6: Attendance

1. Create an event
2. Mark 5-10 attendees as present
3. Open second browser window
4. Verify real-time updates appear
5. Test mobile check-in interface

### Phase 7: Polish

1. Check all dashboard stats
2. Verify all widgets load
3. Test toast notifications
4. Check all loading states
5. Full responsive testing

---

## Test Data

### Sample Attendees

```json
[
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "status": "member",
    "joinDate": "2023-01-15"
  },
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "status": "visitor"
  }
]
```

### Sample Events

```json
[
  {
    "name": "Sunday Service",
    "eventType": "Sunday Service",
    "date": "2026-03-30",
    "startTime": "09:00",
    "endTime": "11:00",
    "location": "Main Sanctuary"
  },
  {
    "name": "Youth Retreat",
    "eventType": "Retreat",
    "date": "2026-04-15",
    "startTime": "08:00",
    "endTime": "17:00",
    "location": "Camp Site"
  }
]
```

---

## Automated Testing (Future)

### Unit Tests (Jest/Vitest)

```typescript
// Example test structure for future implementation
describe('Attendee utils', () => {
  it('should format attendee name correctly', () => {
    const attendee = { firstName: 'John', lastName: 'Smith' }
    expect(formatAttendeeName(attendee)).toBe('John Smith')
  })
})
```

### E2E Tests (Playwright/Cypress)

```typescript
// Example E2E test for future implementation
test('user can create attendee', async ({ page }) => {
  await page.goto('/attendees/new')
  await page.fill('[name="firstName"]', 'Test')
  await page.fill('[name="lastName"]', 'User')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Attendee created')).toBeVisible()
})
```

---

## Bug Reporting Template

When you find a bug, document it with:

```markdown
**Bug Title:** Brief description

**Steps to Reproduce:**

1. Go to...
2. Click on...
3. Enter...

**Expected Result:**
What should happen

**Actual Result:**
What actually happens

**Environment:**

- Browser: Chrome 120
- OS: macOS 14
- Screen size: 1920x1080

**Screenshots:** (if applicable)

**Console Errors:** (if any)
```

---

_Last Updated: 2026-03-20_
