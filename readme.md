This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# YouTube Automation AI Agents - Frontend

A military-themed command center interface for managing YouTube automation AI agents.

## Backend Integration

The frontend is integrated with the backend API deployed at:
**https://automation-agent-backend.vercel.app/**

### Available Agents & Endpoints

1. **AGENT-001: Channel Auditor** - `POST /api/agent1/audit-channel`
2. **AGENT-002: Title Auditor** - `POST /api/agent2/audit-titles`
3. **AGENT-003: Script Writer** - `POST /api/agent3/generate-script`
4. **AGENT-004: Scene Director** - `POST /api/agent4/script-to-prompts`
5. **AGENT-005: Ideas Generator** - `POST /api/agent5/generate-ideas`
6. **AGENT-006: Roadmap Strategist** - `POST /api/agent6/generate-roadmap`

### API Configuration

The app defaults to production: `https://automation-agent-backend.vercel.app`

#### Switching Between Local and Production

**For LOCAL Development:**
1. Copy the example file:
   ```bash
   copy env.local.example .env.local
   ```
2. Edit `.env.local` and set:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Restart dev server: `npm run dev`

**For PRODUCTION Backend:**
1. Delete `.env.local` (uses default Vercel URL), OR
2. Set in `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=https://automation-agent-backend.vercel.app
   ```

**Quick Switch:**
- Local: `echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local`
- Production: `del .env.local` (Windows) or `rm .env.local` (Mac/Linux)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
