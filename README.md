# AI Chat Agent with Memory

A real-time chat application featuring an AI assistant that remembers conversations using LiveKit for real-time communication, OpenAI for intelligent responses, and Mem0 for persistent memory.

## Features

- **Real-time Chat**: Instant messaging powered by LiveKit WebRTC
- **AI Assistant**: Intelligent responses using OpenAI's GPT models
- **Persistent Memory**: AI remembers past conversations using Mem0
- **Modern UI**: Beautiful, responsive interface with real-time indicators
- **Session Management**: Track connection time and room details
- **Multi-participant**: Support for multiple users in the same room

## Architecture

```
┌─────────────────┐                         ┌──────────────────┐
│   Frontend      │ ◄─────────────────────► │    Backend       │
│   (Next.js)     │                         │    (Python)      │
│                 │                         │                  │
│ • Chat UI       │                         │ • AI Agent       │
│ • Room Mgmt     │                         │ • Message Handle │
│ • Auth Tokens   │                         │ • Memory Store   │
└─────────────────┘                         └──────────────────┘
         │                                           │
         │                                           │
         ▼                                           ▼
┌─────────────────┐                        ┌──────────────────┐
│    LiveKit      │                        │   External APIs  │
│    Server       │                        │                  │
│                 │                        │ • OpenAI GPT     │
│ • WebRTC        │                        │ • Mem0 Memory    │
│ • Room Mgmt     │                        │ • LiveKit Cloud  │
│ • Data Channel  │                        │                  │
└─────────────────┘                        └──────────────────┘
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **LiveKit Cloud Account** 
- **OpenAI API Key**
- **Mem0 API Key**

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd backend
```

### 2. Backend Setup

```bash
cd backend
pip install openai python-dotenv livekit livekit-agents mem0ai
```

Create `backend/.env`:
```env
# LiveKit Configuration
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# OpenAI Configuration
OPENAI_API_KEY=
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo

# Memory Configuration
MEM0_API_KEY=

# Agent Configuration
AGENT_IDENTITY=AI-Assistant
DEFAULT_ROOM=chat-room
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://your-livekit-url.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 4. Start Services

**Backend (Terminal 1):**
```bash
cd backend
python3 main.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### 5. Access Application
Open http://localhost:3000 in your browser.


## Configuration Details

### Environment Variables

#### Backend (.env)
- `LIVEKIT_URL`: WebSocket URL from LiveKit Cloud
- `LIVEKIT_API_KEY`: API key from LiveKit dashboard
- `LIVEKIT_API_SECRET`: API secret from LiveKit dashboard
- `OPENAI_API_KEY`: OpenAI API key for GPT responses
- `MEM0_API_KEY`: Mem0 API key for conversation memory
- `LLM_MODEL`: OpenAI model to use (default: gpt-3.5-turbo)
- `AGENT_IDENTITY`: Display name for the AI assistant

#### Frontend (.env.local)
- `NEXT_PUBLIC_LIVEKIT_WS_URL`: Public WebSocket URL (same as backend LIVEKIT_URL)
- `LIVEKIT_API_KEY`: API key for token generation
- `LIVEKIT_API_SECRET`: API secret for token generation

### Getting API Keys

#### LiveKit (Free)
1. Sign up at https://cloud.livekit.io
2. Create a new project
3. Copy the WebSocket URL, API Key, and API Secret

#### OpenAI
1. Sign up at https://platform.openai.com
2. Go to API Keys section
3. Create a new API key
4. Add billing information (pay-per-use)

#### Mem0
1. Sign up at https://mem0.ai
2. Go to dashboard
3. Generate API key

## Usage

1. **Join Room**: Enter username and room name
2. **Chat**: Send messages to communicate with AI
3. **Memory**: AI remembers context across sessions
4. **Multi-user**: Multiple users can join same room
5. **Leave**: Use leave button to exit room


## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify all environment variables are set
- Check Python version (3.8+ required)
- Ensure all dependencies are installed

**Frontend connection issues:**
- Verify LIVEKIT_WS_URL matches backend LIVEKIT_URL
- Check if backend agent is running
- Verify API keys are correct

**AI not responding:**
- Check OpenAI API key and billing status
- Verify Mem0 API key is valid
- Check backend logs for errors

**Memory not working:**
- Verify Mem0 API key
- Check if conversations are being stored
- Review backend logs for memory errors