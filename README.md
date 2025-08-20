# AI Voice Generator by Kelvin Dim

A web application that transforms text into natural-sounding speech using OpenAI's text-to-speech technology. 
Built with Next.js 15, TypeScript, and modern web technologies.

## Features

- 🎙️ 8 distinct AI voice personalities
- 🎛️ Advanced voice customization (tone, emotion, pacing, delivery)
- 📁 Cloud-based audio library management
- 🔐 Google OAuth authentication
- 🌓 Dark/Light theme support
- 📱 Responsive design for all devices
- ⚡ Real-time audio generation (2-3 seconds)
- 💾 Download and save generated audio files

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Supabase Storage
- **AI/ML**: OpenAI TTS API (gpt-4o-mini)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Supabase account
- OpenAI API key
- Google OAuth credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kelvindimson/ai-voice-generator.git
cd ai-voice-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
touch .env.local
```

4. Add the following environment variables to `.env.local`:
```env
# Authentication
AUTH_SECRET=your_auth_secret_here
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Environment Variables Setup Guide

### AUTH_SECRET
Generate a random secret for NextAuth:
```bash
openssl rand -base64 32
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API keys section
3. Create new secret key
4. Copy and save securely

### Database URL
Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

Example:
- Local: `postgresql://postgres:password@localhost:5432/aivoice`
- Supabase: Check your project's database settings

### Supabase Setup
1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

Run database migrations:
```bash
npm run db:push
```

Generate database client:
```bash
npm run db:generate
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── audio/             # Audio pages
│   ├── login/             # Authentication
│   └── new-audio/         # Audio generation
├── components/            # React components
├── db/                    # Database schema and config
├── lib/                   # Utility functions
├── models/                # Data models and schemas
├── providers/             # React context providers
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate database types
- `npm run db:studio` - Open Drizzle Studio

## API Endpoints

- `POST /api/v1/audio/generate` - Generate new audio
- `POST /api/v1/audio/save` - Save audio to library
- `GET /api/v1/audio` - Get user's audio files
- `GET /api/v1/audio/[id]` - Get specific audio file
- `DELETE /api/v1/audio/[id]` - Delete audio file

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Important Production Settings

- Set `NODE_ENV=production`
- Update OAuth redirect URLs
- Configure CORS if needed
- Set up rate limiting
- Enable Vercel Analytics

## Testing

Run unit tests:
```bash
npm run test
```

Run test coverage:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Troubleshooting

### Common Issues

**Google OAuth not working:**
- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure Google+ API is enabled

**Audio generation fails:**
- Verify OpenAI API key is valid
- Check API quota and billing
- Ensure text is properly sanitized

**Database connection issues:**
- Verify DATABASE_URL format
- Check database server is running
- Ensure SSL settings are correct for production

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues first
- Provide reproduction steps

## Acknowledgments

- OpenAI for TTS API
- Vercel for hosting
- Supabase for storage
- shadcn/ui for components