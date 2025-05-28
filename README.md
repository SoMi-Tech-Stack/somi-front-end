# Music Education Platform

A comprehensive platform for music educators to create engaging listening activities and track curriculum evidence.

## 🎯 Features

- AI-powered listening activity generation
- Music notation display and playback
- YouTube integration for trusted classical recordings
- Performance recording and analysis
- Curriculum evidence tracking
- Analytics and feedback collection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (or alternative database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/music-education-platform.git
cd music-education-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
VITE_OPENAI_API_KEY=your_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

4. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── components/        # React components
├── lib/              # Core functionality
│   ├── database/     # Database abstraction layer
│   ├── ai/           # AI integration
│   └── analytics/    # Analytics tracking
├── modules/          # Feature modules
│   ├── lesson-planner/
│   └── performance/
├── utils/            # Utility functions
└── types/            # TypeScript definitions
```

## 🔄 Database Abstraction

The project uses a database abstraction layer (`src/lib/database`) that allows switching between different database providers. Currently implemented:

- Supabase (default)
- SQLite (for development)

To implement a new database provider:

1. Create a new class implementing the `DatabaseProvider` interface
2. Update the database initialization in `src/lib/database/index.ts`

## 🎵 Music Integration

The platform supports multiple music notation sources:

- MuseScore
- IMSLP
- OpenScore
- Musicalion

Integration is handled through the `src/lib/music` module.

## 📊 Analytics

Activity tracking and feedback collection is implemented in `src/lib/analytics`.

Data collected:
- Activity generation parameters
- User feedback (ratings and comments)
- Performance recordings metadata

## 🔒 Security

- Row Level Security (RLS) enabled for all database tables
- Authentication handled through Supabase Auth
- API keys stored in environment variables
- Content filtering for AI-generated responses

## 🧪 Testing

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Component Library](docs/components.md)
- [AI Integration](docs/ai.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.# somi-front-end
