import { convexAuth } from '@convex-dev/auth/server'
import Google from '@auth/core/providers/google'
import Facebook from '@auth/core/providers/facebook'
import { Password } from '@convex-dev/auth/providers/Password'
import { createOrLinkAttendee } from './lib/attendeeLinking'

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, args) => {
      // Auto-link or create attendee when user is created/updated
      const user = {
        _id: args.userId,
        email: args.profile.email,
        name: args.profile.name as string,
      }

      await createOrLinkAttendee(ctx, user, args.profile as any)
    },
  },
})
