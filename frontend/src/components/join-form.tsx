'use client'
import { useState, FormEvent, ChangeEvent } from 'react'
import { MessageCircle, User, Hash, ArrowRight, Bot } from 'lucide-react'

type JoinFormProps = {
  onJoin: (data: any) => void
}

export default function JoinForm({ onJoin }: JoinFormProps) {
  const [username, setUsername] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('chat-room')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!username.trim() || !roomName.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          roomName: roomName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get access token')
      }

      onJoin(data)
    } catch (err: any) {
      setError(err.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }

  const handleRoomNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value)
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 rotate-3 hover:rotate-0 transition-transform duration-300">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Join Chat Room
        </h2>
        <p className="text-slate-400">
          Connect with an AI assistant that remembers you
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-slate-300">
            Username
          </label>
          <div className="relative">
            <input type="text" id="username" value={username} onChange={handleUsernameChange} disabled={loading}
              className="w-full pl-4 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent placeholder-slate-400 text-white transition-all duration-200 backdrop-blur-sm"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="roomName" className="block text-sm font-medium text-slate-300">
            Room Name
          </label>
          <div className="relative">
            <input type="text" id="roomName" value={roomName} onChange={handleRoomNameChange} disabled={loading}
              className="w-full pl-4 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent placeholder-slate-400 text-white transition-all duration-200 backdrop-blur-sm"
              placeholder="Enter room name"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-300 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !username.trim() || !roomName.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <span>Join Room</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <div className="text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6"></div>
          <h3 className="text-sm font-semibold text-slate-300 2xl:mb-4">Made by Aryan Mane</h3>
        </div>
        
        <div className="hidden 2xl:flex justify-center gap-3">
          <div className="flex items-center w-52 space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">Smart AI-Assistant</div>
              <div className="text-xs text-slate-400">Powered by OpenAI</div>
            </div>
          </div>
          
          <div className="flex items-center w-52 space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">Real-time Chat</div>
              <div className="text-xs text-slate-400">Instant messaging</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}