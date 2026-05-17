# Checkers

A full-stack multiplayer checkers game with AI bot opponent and real-time game analysis powered by Claude.

Play checkers online with friends via room codes, compete against an AI opponent with adjustable difficulty, and get post-game insights from an AI coach that analyzes your moves. Track your stats on the global leaderboard, review your game history, and customize your profile.

Built with FastAPI, React, Supabase, and Claude Sonnet 4.6.

## Features

- **Multiplayer** — Play with friends using room codes; real-time move synchronization via Supabase Realtime
- **AI Bot Opponent** — Adjustable difficulty levels (5 presets) using minimax algorithm
- **Game Review** — Post-game analysis with AI Coach (Claude Sonnet 4.6) providing strategic insights
- **User Profiles** — Google OAuth authentication; customizable display names and avatars
- **Leaderboard** — Global ranking by wins, losses, and rating
- **Game History** — Track all matches with detailed statistics and replay capability
- **Responsive Design** — Optimized for phone, tablet, and desktop layouts

## Tech Stack

**Backend:**
- FastAPI (Python) — REST API for game logic, bot moves, and user data
- Python checkers engine — Pure game rules, board state, piece movement, and validity checks

**Frontend:**
- React 18 — Single-page application with Babel transpiler (no build tool)
- Responsive CSS — Mobile-first design with tablet/desktop breakpoints

**Database & Auth:**
- Supabase — PostgreSQL database, Google OAuth, real-time broadcast channels, presence tracking

**AI:**
- Claude Sonnet 4.6 (Anthropic API) — Game review analysis and strategic recommendations

## Project Structure

```
checkers/
├── api/
│   ├── routes.py          # FastAPI endpoints
│   └── ...
├── db/
│   └── supabase.py        # Supabase client & queries
├── game/
│   ├── game.py            # Game state & move logic
│   ├── board.py           # Board representation
│   ├── piece.py           # Piece state
│   ├── moves.py           # Move generation
│   ├── rules.py           # Rule enforcement
│   └── bot.py             # Minimax bot opponent
├── frontend/
│   ├── Checkers.html      # Entry point
│   ├── app.jsx            # Router & page manager
│   ├── login.jsx          # OAuth login page
│   ├── profile-setup.jsx  # First-time profile creation
│   ├── dashboard.jsx      # Home & play mode selection
│   ├── game.jsx           # Interactive board (bot/local/multiplayer)
│   ├── game-review.jsx    # AI-powered post-game analysis
│   ├── history.jsx        # Match history & stats
│   ├── leaderboard.jsx    # Global rankings
│   ├── settings.jsx       # User settings & theme
│   └── audio.jsx          # Sound effects wrapper
├── requirements.txt       # Python dependencies
├── Procfile               # Railway deployment config
└── README.md
```

## Setup

### Prerequisites

- Python 3.9+
- Node.js (optional; frontend runs in browser with React CDN)
- Supabase account (free tier works)
- Claude API key (for game review feature)

### Installation

1. **Clone and install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables:**
   Create a `.env` file in the project root:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

3. **Set up the database:**
   In Supabase, create these tables:
   - `profiles` — User data (id, display_name, avatar_url, region)
   - `games` — Match records (id, room_code, player1_id, player2_id, state, winner, etc.)
   - `moves` — Move history for replay (game_id, move, timestamp, etc.)

### Running Locally

1. **Start the FastAPI backend:**
   ```bash
   python -m uvicorn api.routes:app --reload
   ```
   The API will run at `http://localhost:8000`

2. **Open the frontend:**
   Open `frontend/Checkers.html` in your browser. The frontend loads React and components from the CDN.

   For local development, serve via HTTP (not `file://`) to enable Supabase auth:
   ```bash
   # Using Python
   python -m http.server 8080 --directory .
   # Then open http://localhost:8080/frontend/Checkers.html
   ```

## How to Play

1. **Login** — Sign in with Google
2. **Choose a mode:**
   - **vs Bot** — Play against an AI opponent; select difficulty
   - **vs Friend (Local)** — Two players, same device
   - **Multiplayer** — Create or join a room; share the code with a friend
3. **Move pieces** — Click a piece to select, then click a valid square to move
4. **Game End** — Review your match with AI insights and statistics
5. **Leaderboard** — Check your ranking and compete globally

## Multiplayer Architecture

- **Room codes** — Generated 6-character codes for player pairing
- **Supabase Realtime** — Broadcast channels sync moves in real-time
- **Presence tracking** — Know when opponent connects/disconnects
- **Canonical state** — FastAPI holds authoritative game state; clients request refresh after each move

## Game Review (AI Coach)

After each game, Claude Sonnet 4.6 analyzes:
- Key turning points
- Missed captures and optimal moves
- Strategic recommendations for improvement

Review is available for bot, local, and multiplayer matches.

## API Endpoints

- `POST /game/new` — Start a new game
- `POST /game/{id}/move` — Submit a move
- `GET /game/{id}/board` — Get game state
- `POST /game/{id}/bot-move` — Request bot's next move
- `GET /user/{id}/history` — Get user's game history
- `GET /leaderboard` — Get top players

## Styling

All styling is embedded in `Checkers.html` using CSS custom properties:
- Warm walnut/ivory premium theme
- Responsive breakpoints: phone (≤640px), tablet (641–1024px), laptop (≥1025px)
- Smooth page transitions and animations

## Deployment

### Railway

1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `ANTHROPIC_API_KEY`
3. Railway auto-detects `Procfile` and deploys
4. Your app runs at `https://<your-railway-app>.railway.app`

Railway handles:
- Auto scaling
- SSL certificates
- Environment variable management
- Zero-downtime deploys

## Known Limitations

- No persistent game recovery (if browser closes mid-game, room is lost)
- No chat during multiplayer matches
- Leaderboard refresh is manual (not real-time)

## Future Enhancements

- Time controls (blitz, rapid, classical)
- Spectator mode for live games
- Match ratings & ELO system
- Tournament brackets
- Mobile app (native)

## License

MIT

## Support

For issues or feedback, contact the development team.
