import { internalMutation } from '../_generated/server'
import { v } from 'convex/values'

const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
]

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
]

const streets = [
  'Main St',
  'Oak Ave',
  'Maple Rd',
  'Cedar Ln',
  'Pine St',
  'Elm Dr',
  'Washington Blvd',
  'Lakeview Dr',
  'Highland Ave',
  'Church St',
  'School Rd',
  'Park Ave',
  'Sunset Blvd',
]

const domains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'church.org',
  'email.com',
]

const statuses = ['member', 'visitor', 'inactive'] as const

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generatePhone(): string {
  const area = Math.floor(Math.random() * 900) + 100
  const prefix = Math.floor(Math.random() * 900) + 100
  const line = Math.floor(Math.random() * 9000) + 1000
  return `+1 (${area}) ${prefix}-${line}`
}

function generateDateOfBirth(): number {
  // Generate birthdate between 18 and 80 years ago
  const now = Date.now()
  const minAge = 18 * 365.25 * 24 * 60 * 60 * 1000
  const maxAge = 80 * 365.25 * 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * (maxAge - minAge) + minAge)
}

function generateJoinDate(): number {
  // Generate join date within last 5 years
  const now = Date.now()
  const fiveYears = 5 * 365.25 * 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * fiveYears)
}

export const generateTestAttendees = internalMutation({
  args: {
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const createdIds = []
    const now = Date.now()

    for (let i = 0; i < args.count; i++) {
      const firstName = getRandomItem(firstNames)
      const lastName = getRandomItem(lastNames)
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@${getRandomItem(domains)}`

      // Weighted status (60% member, 30% visitor, 10% inactive)
      const statusRoll = Math.random()
      const status =
        statusRoll < 0.6 ? 'member' : statusRoll < 0.9 ? 'visitor' : 'inactive'

      const searchField = `${firstName} ${lastName} ${email}`.toLowerCase()

      const id = await ctx.db.insert('attendees', {
        firstName,
        lastName,
        email,
        phone: Math.random() > 0.2 ? generatePhone() : undefined, // 80% have phone
        dateOfBirth: Math.random() > 0.3 ? generateDateOfBirth() : undefined, // 70% have DOB
        address:
          Math.random() > 0.4
            ? `${Math.floor(Math.random() * 9999)} ${getRandomItem(streets)}`
            : undefined, // 60% have address
        status,
        joinDate: status !== 'visitor' ? generateJoinDate() : undefined, // Members/inactive have join date
        notes:
          Math.random() > 0.7
            ? `Test attendee created for pagination testing.`
            : undefined,
        searchField,
        createdAt: now,
        updatedAt: now,
      })

      createdIds.push(id)
    }

    return { created: createdIds.length, ids: createdIds }
  },
})
