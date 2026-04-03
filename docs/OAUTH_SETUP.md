# OAuth Setup Guide

Complete guide for configuring Google and Facebook OAuth authentication in CJCRSG-Hub.

---

## Overview

CJCRSG-Hub supports three authentication methods:

- **Email & Password** (built-in, works immediately)
- **Google OAuth** (requires setup)
- **Facebook OAuth** (requires setup)

OAuth credentials are configured as **server-side environment variables** in your Convex deployment. They are never stored in `.env.local` or client-side code.

---

## Prerequisites

- A Convex deployment (local or cloud)
- Admin access to Convex dashboard
- Google account (for Google Cloud Console)
- Facebook account (for Facebook Developers)

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "CJCRSG-Hub")
4. Click **Create**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - **User Type**: External
   - **App name**: CJCRSG-Hub
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - Click **Save and Continue** through scopes and test users
4. Back on the credentials page:
   - **Application type**: Web application
   - **Name**: CJCRSG-Hub OAuth
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.com/api/auth/callback/google` (production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Convex Environment Variables

Set these in your Convex dashboard:

```bash
# For local development
pnpm dlx convex env set AUTH_GOOGLE_ID your-client-id
pnpm dlx convex env set AUTH_GOOGLE_SECRET your-client-secret

# Or via Convex dashboard:
# 1. Go to https://dashboard.convex.dev
# 2. Select your deployment
# 3. Go to Environment Variables
# 4. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
```

---

## Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select use case: **Authenticate and request data from users with Facebook Login**
4. Select app type: **Consumer**
5. Enter app name: "CJCRSG-Hub"
6. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, go to **Add Product** → **Facebook Login**
2. Click **Set Up**
3. Select **Web** as the platform

### Step 3: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings**
2. Set **Valid OAuth Redirect URIs**:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://your-domain.com/api/auth/callback/facebook` (production)
3. Click **Save Changes**

### Step 4: Get App ID and Secret

1. Go to **Settings** → **Basic**
2. Copy the **App ID** and **App Secret**
3. Make sure **App Domains** includes your domain (for production)

### Step 5: Configure Convex Environment Variables

Set these in your Convex dashboard:

```bash
# For local development
pnpm dlx convex env set AUTH_FACEBOOK_ID your-app-id
pnpm dlx convex env set AUTH_FACEBOOK_SECRET your-app-secret

# Or via Convex dashboard (see Google setup above)
```

---

## Environment Variables Reference

| Variable               | Description                | Example                                    |
| ---------------------- | -------------------------- | ------------------------------------------ |
| `AUTH_GOOGLE_ID`       | Google OAuth Client ID     | `123456789-abc.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET`   | Google OAuth Client Secret | `GOCSPX-xxxxxxxxxxxxxxxxxxxx`              |
| `AUTH_FACEBOOK_ID`     | Facebook App ID            | `123456789012345`                          |
| `AUTH_FACEBOOK_SECRET` | Facebook App Secret        | `abcdef1234567890abcdef1234567890`         |

**Note:** These are server-side environment variables only. They are configured in the Convex dashboard, not in `.env.local`.

---

## Redirect URIs Reference

| Provider | Environment | Redirect URI                                         |
| -------- | ----------- | ---------------------------------------------------- |
| Google   | Local       | `http://localhost:3000/api/auth/callback/google`     |
| Google   | Production  | `https://your-domain.com/api/auth/callback/google`   |
| Facebook | Local       | `http://localhost:3000/api/auth/callback/facebook`   |
| Facebook | Production  | `https://your-domain.com/api/auth/callback/facebook` |

---

## Verification

After configuring OAuth credentials:

1. Start your development server:

   ```bash
   pnpm dev
   ```

2. Go to the login page: `http://localhost:3000/login`

3. You should see **Sign in with Google** and **Sign in with Facebook** buttons

4. Test the OAuth flows:
   - Click **Sign in with Google** → Should redirect to Google → Return to app
   - Click **Sign in with Facebook** → Should redirect to Facebook → Return to app

5. After successful OAuth login:
   - Check Settings > Account page
   - Verify the authentication method appears in the list
   - Verify attendee profile is auto-linked (if email matches existing attendee)

---

## Troubleshooting

### OAuth redirect mismatch

**Error:** `redirect_uri_mismatch`

**Solution:**

- Verify the redirect URI in Google/Facebook console matches exactly
- Include the trailing slash if required
- Check for `http://` vs `https://` mismatch

### Invalid client credentials

**Error:** `invalid_client`

**Solution:**

- Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are correct
- Check for extra spaces or line breaks in environment variables
- Restart Convex dev server after changing environment variables

### OAuth consent screen not configured

**Error:** Google shows "App is not verified" or blocks sign-in

**Solution:**

- Complete the OAuth consent screen setup in Google Cloud Console
- Add test users if app is in testing mode
- For production, submit app for verification

### Facebook app in development mode

**Error:** Only app admins/testers can sign in

**Solution:**

- Go to Facebook App Dashboard → **App Review** → **Make public**
- Or add specific users as testers in **Roles** → **Testers**

---

## Security Notes

- **Never commit OAuth secrets to version control**
- OAuth credentials are server-side only (Convex handles the flow)
- Use different credentials for development and production
- Rotate secrets periodically
- Monitor OAuth usage in Google Cloud Console and Facebook App Dashboard

---

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google/Facebook consoles to use your production domain
2. Set environment variables on your production Convex deployment:
   ```bash
   pnpm dlx convex deploy
   pnpm dlx convex env set AUTH_GOOGLE_ID your-production-google-id
   pnpm dlx convex env set AUTH_GOOGLE_SECRET your-production-google-secret
   pnpm dlx convex env set AUTH_FACEBOOK_ID your-production-facebook-id
   pnpm dlx convex env set AUTH_FACEBOOK_SECRET your-production-facebook-secret
   ```

---

_Last Updated: 2026-04-03_
