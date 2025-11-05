# Sales Automation Platform

A modern AI-powered sales automation tool for LinkedIn prospecting and outreach with Act! CRM integration.

## Features

- 🤖 **AI-Powered Message Generation** - Uses Claude AI to create personalized LinkedIn messages
- 🎯 **Smart Prospecting** - Find and target the right contacts based on industry, title, location
- 📊 **Campaign Management** - Create and manage multiple outreach campaigns
- 🔄 **Act! CRM Integration** - Two-way sync with Act! CRM for seamless lead management
- 👥 **Multi-User Support** - Team collaboration with role-based access control
- 📈 **Analytics Dashboard** - Track campaign performance and ROI
- 🔐 **Enterprise Security** - Row-level security and data encryption

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **CRM Integration**: Act! CRM API

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account
- An Anthropic API key
- A Vercel account (for deployment)
- Act! CRM API credentials (provided by your client)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sales-automation-platform.git
cd sales-automation-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Execute in SQL Editor
3. Get your Supabase credentials:
   - Go to **Settings** > **API**
   - Copy `Project URL` and `anon public` key
   - Copy `service_role` key (keep this secret!)

### 4. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Act! CRM Configuration (get from client)
ACT_CRM_API_URL=https://api.act.com
ACT_CRM_API_KEY=your_act_crm_api_key
ACT_CRM_CLIENT_ID=your_act_crm_client_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sales-automation-platform/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (dashboard)/         # Dashboard pages
│   │   └── api/                 # API routes
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   ├── campaigns/           # Campaign components
│   │   ├── prospects/           # Prospect components
│   │   └── analytics/           # Analytics components
│   ├── lib/                     # Utility libraries
│   │   ├── supabase/           # Supabase client
│   │   ├── anthropic/          # Claude AI client
│   │   ├── crm/                # Act! CRM client
│   │   └── utils/              # Helper functions
│   ├── types/                   # TypeScript types
│   └── hooks/                   # Custom React hooks
├── supabase/
│   └── migrations/              # Database migrations
└── public/                      # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/start` - Start campaign
- `POST /api/campaigns/[id]/pause` - Pause campaign

### Prospects
- `GET /api/prospects` - List prospects (with filters)
- `POST /api/prospects` - Create new prospect
- `GET /api/prospects/[id]` - Get prospect details
- `PUT /api/prospects/[id]` - Update prospect
- `POST /api/prospects/bulk` - Bulk import prospects

### Messages
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `POST /api/messages/generate` - Generate AI message

### AI
- `POST /api/ai/generate-message` - Generate personalized message
- `POST /api/ai/improve-message` - Improve existing message
- `POST /api/ai/variations` - Generate message variations

### CRM
- `POST /api/crm/sync` - Sync prospect to Act! CRM
- `POST /api/crm/bulk-sync` - Bulk sync prospects
- `GET /api/crm/test` - Test CRM connection

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/campaign/[id]` - Campaign analytics

## Database Schema

### Tables

- **companies** - Organization/company information
- **user_profiles** - User profile data
- **campaigns** - Outreach campaigns
- **prospects** - Potential leads
- **messages** - LinkedIn messages
- **campaign_analytics** - Campaign performance metrics

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## Development Workflow

### 1. Create a New Feature

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the existing code structure and patterns.

### 3. Test Your Changes

```bash
npm run build
npm run start
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Open a PR on GitHub for review.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local`)
5. Deploy!

Vercel will automatically deploy on every push to main branch.

### Environment Variables on Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
ACT_CRM_API_URL
ACT_CRM_API_KEY
ACT_CRM_CLIENT_ID
NEXT_PUBLIC_APP_URL
```

## Act! CRM Integration Setup

### Getting Act! CRM Credentials from Client

1. Ask your client to provide:
   - API URL (usually https://api.act.com)
   - API Key
   - Client ID

2. Update `.env.local` with these credentials

3. Test the connection:
   ```bash
   curl http://localhost:3000/api/crm/test
   ```

### Configuring CRM Sync

The platform automatically syncs prospects to Act! CRM when:
- A new prospect is added to a campaign
- A prospect's status changes
- A message is sent to a prospect

You can also manually trigger sync from the UI.

## User Roles

### Admin
- Full access to all features
- Manage company settings
- Add/remove team members
- Configure Act! CRM integration

### Manager
- Create and manage campaigns
- View all prospects and messages
- Access analytics
- Cannot manage company settings

### Rep
- View assigned prospects
- Send messages
- Update prospect status
- Limited analytics access

## Best Practices

### LinkedIn Safety
- Respect LinkedIn's daily limits (20-40 connection requests/day)
- Use natural language in messages
- Avoid spammy behavior
- Rotate between team accounts if needed

### Message Personalization
- Always use AI personalization
- Review AI-generated messages before sending
- Include prospect-specific details
- Keep messages under 300 characters for connection requests

### CRM Sync
- Sync prospects regularly
- Check for duplicates before creating
- Update Act! CRM with interaction history
- Use proper contact categorization

## Troubleshooting

### Database Connection Issues
```bash
# Check Supabase connection
curl https://your-project.supabase.co/rest/v1/
```

### API Key Issues
```bash
# Test Anthropic API
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact the development team

## License

Proprietary - All rights reserved

## Contributing

This is a private project. Contact the maintainer for contribution guidelines.

---

Built with ❤️ for efficient B2B sales automation