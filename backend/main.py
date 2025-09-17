#!/usr/bin/env python3
"""
Simple AI Chat Agent - Single file implementation
"""

import asyncio
import json
import logging
import os
import sys
from typing import Dict, Any

import openai
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import JobContext, WorkerOptions, cli
from mem0 import MemoryClient

# Load environment variables FIRST - before any other imports or operations
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SimpleAgent:
    def __init__(self):
        """Initialize the agent with lazy-loaded services"""
        self.memory_client = None
        self.openai_client = None
        self.room = None
        logger.info("Simple Agent initialized")

    def _init_services(self):
        """Initialize services when needed"""
        if not self.memory_client:
            api_key = os.getenv("MEM0_API_KEY")
            if not api_key:
                raise ValueError("MEM0_API_KEY is required")
            self.memory_client = MemoryClient(api_key=api_key)
            logger.info("Memory client initialized")

        if not self.openai_client:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY is required")
            self.openai_client = openai.AsyncOpenAI(api_key=api_key)
            logger.info("OpenAI client initialized")

    async def get_user_context(self, username: str, query: str = None) -> str:
        """Get user context from memory"""
        try:
            if query:
                memories = self.memory_client.search(
                    query=query,
                    user_id=username,
                    limit=5
                )
            else:
                memories = self.memory_client.get_all(
                    user_id=username,
                    limit=10
                )
            
            if not memories:
                return f"No previous context found for user {username}."
            
            context_parts = [f"Previous context for {username}:"]
            for i, memory in enumerate(memories, 1):
                if isinstance(memory, dict):
                    memory_text = memory.get('memory', memory.get('text', str(memory)))
                else:
                    memory_text = str(memory)
                context_parts.append(f"{i}. {memory_text}")
            
            return "\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Error getting user context: {e}")
            return f"Unable to retrieve previous context for {username}."

    async def store_interaction(self, username: str, user_message: str, ai_response: str):
        """Store interaction in memory"""
        try:
            self.memory_client.add(
                messages=[
                    {"role": "user", "content": user_message},
                    {"role": "assistant", "content": ai_response}
                ],
                user_id=username
            )
            logger.info(f"Stored interaction for {username}")
        except Exception as e:
            logger.error(f"Error storing interaction: {e}")

    async def generate_response(self, user_message: str, username: str, context: str = "") -> str:
        """Generate AI response"""
        try:
            system_prompt = f"""You are a helpful AI assistant chatting with {username} in a real-time chat room.

Keep responses concise and conversational (max 2-3 sentences usually).
Be friendly and remember you're in a chat environment.

{"Previous conversation context:\n" + context if context.strip() else "This is your first interaction with " + username + "."}
"""
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            response = await self.openai_client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-3.5-turbo"),
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm sorry, I'm having trouble processing your message right now."

    async def send_message(self, message: str):
        """Send message to the room"""
        if not self.room:
            return
            
        try:
            message_data = {
                "message": message,
                "sender": os.getenv("AGENT_IDENTITY", "AI Assistant"),
                "timestamp": asyncio.get_event_loop().time()
            }
            
            data = json.dumps(message_data).encode('utf-8')
            await self.room.local_participant.publish_data(data, reliable=True)
            
        except Exception as e:
            logger.error(f"Error sending message: {e}")

    async def handle_message(self, data: rtc.DataPacket, participant: rtc.RemoteParticipant):
        """Handle incoming messages"""
        try:
            message_str = data.data.decode('utf-8')
            message_data = json.loads(message_str)
            
            user_message = message_data.get('message', '').strip()
            username = message_data.get('sender') or participant.identity
            agent_identity = os.getenv("AGENT_IDENTITY", "AI Assistant")
            
            if not user_message or username == agent_identity:
                return
                
            logger.info(f"Message from {username}: {user_message}")
            
            # Get context and generate response
            context = await self.get_user_context(username, user_message)
            ai_response = await self.generate_response(user_message, username, context)
            
            # Send response
            await self.send_message(ai_response)
            
            # Store interaction (don't wait for it)
            asyncio.create_task(
                self.store_interaction(username, user_message, ai_response)
            )
            
            logger.info(f"Responded to {username}")
            
        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def handle_participant_connected(self, participant: rtc.RemoteParticipant):
        """Handle new participant"""
        agent_identity = os.getenv("AGENT_IDENTITY", "AI Assistant")
        if participant.identity != agent_identity:
            logger.info(f"Participant joined: {participant.identity}")
            await asyncio.sleep(1)
            
            # Check if we have context for returning user
            context = await self.get_user_context(participant.identity)
            if "No previous context found" in context:
                greeting = f"Hello {participant.identity}! 👋 I'm {agent_identity}. How can I help you today?"
            else:
                greeting = f"Welcome back, {participant.identity}! 😊 Great to see you again!"
                
            await self.send_message(greeting)

    async def entrypoint(self, ctx: JobContext):
        """Main entry point"""
        try:
            logger.info(f"Connecting to room: {ctx.room.name}")
            
            # Initialize services
            self._init_services()
            
            # Connect to room
            await ctx.connect(auto_subscribe=rtc.AutoSubscribeRule.SUBSCRIBE_NONE)
            self.room = ctx.room
            
            # Set up event handlers
            ctx.room.on("data_received", self.handle_message)
            ctx.room.on("participant_connected", self.handle_participant_connected)
            
            # Send welcome message
            await asyncio.sleep(2)
            agent_identity = os.getenv("AGENT_IDENTITY", "AI Assistant")
            welcome = f"👋 Hi everyone! I'm {agent_identity}, your AI assistant. I remember our conversations!"
            await self.send_message(welcome)
            
            logger.info("Agent successfully connected and ready!")
            
        except Exception as e:
            logger.error(f"Error in entrypoint: {e}")
            raise


# Global agent instance
agent = SimpleAgent()

def validate_config():
    """Validate required environment variables"""
    required_vars = {
        "LIVEKIT_API_KEY": "LiveKit API key is required",
        "LIVEKIT_API_SECRET": "LiveKit API secret is required", 
        "OPENAI_API_KEY": "OpenAI API key is required",
        "MEM0_API_KEY": "mem0 API key is required"
    }
    
    missing = []
    for var, msg in required_vars.items():
        if not os.getenv(var):
            missing.append(f"❌ {msg}")
    
    if missing:
        for msg in missing:
            logger.error(msg)
        sys.exit(1)
    
    logger.info("✅ Configuration validated")

def main():
    """Main function"""
    try:
        validate_config()
        
        logger.info("🚀 Starting AI Chat Agent...")
        logger.info(f"🤖 Agent: {os.getenv('AGENT_IDENTITY', 'AI Assistant')}")
        logger.info(f"🔗 LiveKit: {os.getenv('LIVEKIT_WS_URL')}")
        logger.info(f"🧠 LLM: {os.getenv('LLM_MODEL', 'gpt-3.5-turbo')}")

        # Create WorkerOptions with environment variables
        options = WorkerOptions(
            entrypoint_fnc=agent.entrypoint,
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_WS_URL")
        )
        
        cli.run_app(options)
        
    except KeyboardInterrupt:
        logger.info("👋 Shutting down...")
    except Exception as e:
        logger.error(f"💥 Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()