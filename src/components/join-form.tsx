'use client'
import { useState, FormEvent, ChangeEvent } from 'react'

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
      console.error('Join error:', err)
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
      <h2 className="text-2xl font-bold mb-6 text-center text-neutral-100">
        Join Chat Room
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
            Username
          </label>
          <input type="text" id="username" value={username} onChange={handleUsernameChange} disabled={loading}
            className="w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-neutral-500 text-neutral-50 transition-all duration-150"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-neutral-300 mb-2">
            Room Name
          </label>
          <input type="text" id="roomName" value={roomName} onChange={handleRoomNameChange} disabled={loading}
            className="w-full px-3 py-2 border border-neutral-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-neutral-500 text-neutral-50 transition-all duration-150"
            placeholder="Enter room name"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 rounded-md border border-red-300">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200">
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Joining...
            </span>
          ) : (
            'Join Room'
          )}
        </button>
      </form>

      <div className="mt-6 text-sm text-neutral-400 text-center">
        <p>Once you join, you'll be able to chat with the AI assistant</p>
        <p>The AI will remember your conversations for personalized responses</p>
      </div>
    </div>
  )
}