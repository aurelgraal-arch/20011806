# Enterprise Platform

A production-grade digital platform with reputation-based progression, token economy, governance system, and mission engine. Built with React, TypeScript, and Supabase.

## Features

- **Secure Authentication**: Supabase-powered auth with role-based access control
- **Reputation System**: Gamified progression based on activities
- **Token Economy**: Internal token system for governance and rewards
- **Mission Engine**: Daily, weekly, community, and governance missions
- **Governance System**: Democratic proposal and voting system
- **Ranking Engine**: Weighted leaderboard rankings
- **Activity Feed**: Real-time activity tracking
- **Admin Panel**: Platform management tools
- **Responsive Design**: Mobile-first, dark-first UI
- **Scalable Architecture**: Designed for 1M+ users

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Validation**: Zod
- **Data Fetching**: React Query (ready for integration)
- **Error Handling**: Error Boundaries, Suspense

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── common/       # Shared components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── core/
│   │   ├── engines/      # Business logic engines
│   │   ├── services/     # Data layer
│   │   └── store/        # State management
│   ├── pages/            # Page components
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── main.tsx              # Entry point
├── App.tsx               # Root component
└── index.css             # Global styles
```

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env.local`

### Supabase Backend Setup

To enable real backend integration the following resources should be created in your Supabase project:

1. **Database Tables**
   - `profiles` (id, username, email, role, reputation, level, tokens, bio, joined_date, etc.)
   - `wallets` (`id`, `user_id`, `token_balance`, etc.)
   - `transactions` (`id`, `wallet_id`, `amount`, `type`, `metadata`, `created_at`)
   - `missions`, `user_mission_progress`, `proposals`, `proposal_votes`, `activity_feed`, `notifications`, etc. matching the queries in `src/app/core/services`
   - Add appropriate Row Level Security (RLS) policies allowing users to read/write their own rows.

2. **Edge Function `login`**
   - Create a Supabase Edge Function named `login` that accepts an email/password payload, authenticates with Supabase Auth, and returns the session object. A sample implementation is provided in `supabase/functions/login/index.ts` (see repo).
- **Hash-based login:** Instead of email/password, the frontend will call `login-hash` with a single hash string. The function checks a mapping file (`supabase/issued_sequences/issued_hash.txt`) for a matching email and then signs in that user using the hash as the password. A sample implementation is under `supabase/functions/login-hash/index.ts`.

  The `issued_hash.txt` file should contain lines of `hash,email` pairs (comments allowed). You can generate and distribute hashes as needed.

3. **Realtime subscriptions**
   - Enable realtime for tables used by subscriptions (`profiles`, `activity_feed`, `notifications`, `proposals`).

4. **Environment variables**
   - After copying `.env.example`, fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Once the backend is configured, the frontend will automatically use live data through the services defined in `src/app/core/services`.

#### Deploying Edge Functions

If you need to deploy or update the `login` edge function included in this repo:

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli). 
2. Authenticate: `supabase login`.
3. Navigate to the repo root and run:

   ```bash
   supabase functions deploy login --no-verify-jwt
   ```

   (omit `--no-verify-jwt` if you are using JWT in production.)

4. The function will be available at `${SUPABASE_URL}/functions/v1/login`.

You can modify or add additional functions under `supabase/functions/*` and deploy similarly.
4. Add Supabase credentials
5. `npm run dev`

## Architecture Overview

### Authentication
- Supabase Auth integration
- Session persistence with Zustand
- Protected routes with role-based access
- AuthStore manages auth state

### Reputation System
- Calculated from: missions, governance, consistency
- Unlocks features at each level
- Used in governance voting weight

### Token Economy
- Earned through missions and participation
- Staking rewards (12% APY)
- Governance weight calculation
- Transaction tracking

### Mission Engine
- Multiple mission types with different rewards
- Cooldown and capacity management
- Progress tracking and validation
- Bonus for early completion

### Governance System
- Proposal creation (min rep: 250)
- Weighted voting (rep + tokens)
- Lifecycle tracking (draft → voting → passed/rejected)
- Detailed voting statistics

### Ranking Engine
- Weighted formula: rep(50%) + missions(30%) + governance(20%)
- Real-time leaderboard
- Milestone tracking
- Tier system (Legendary → Novice)

## Database Schema

Key tables needed in Supabase:
- `profiles` - User information and stats
- `wallets` - Token management
- `transactions` - Transaction history
- `missions` - Mission definitions
- `user_mission_progress` - Mission completion tracking
- `proposals` - Governance proposals
- `proposal_votes` - Voting records
- `activity_feed` - Activity tracking

## Security

- Row Level Security (RLS) policies
- Client-side validation with Zod
- Protected routes for authenticated users
- Admin-only pages
- Error boundaries prevent data leaks
- Sensitive operations in services

## Deployment

```bash
npm run build
npm run preview
```

Production deployment:
- Set environment variables
- Enable HTTPS
- Configure CORS in Supabase
- Set up CDN
- Enable rate limiting

## Development Guidelines

### Adding Engines
1. Create in `src/app/core/engines/`
2. Pure functions with clear I/O
3. Document with JSDoc
4. Export as static class

### Adding Pages
1. Create in `src/app/pages/`
2. Use layout components
3. Add route in router
4. Lazy load with React.lazy()

### Adding UI Components
1. Create in `src/app/components/ui/`
2. TypeScript interfaces
3. TailwindCSS styling
4. Export in index.ts

## Future Enhancements

- [ ] Forum system
- [ ] Achievement badges
- [ ] Custom quest builder
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] NFT integration
- [ ] Web3 wallet

## Support

For issues and questions: support@example.com

## License

Proprietary - All rights reserved
