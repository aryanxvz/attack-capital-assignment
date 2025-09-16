'use client'
import { useEffect, useState, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant, Participant } from 'livekit-client'
import MessageList from './message-list'

type ChatRoomProps = {
  token: string
  serverUrl: string
  username: string
  roomName: string
}

type Message = {
  id: number
  text: string
  sender: string
  timestamp: Date
  isBot?: boolean
  isSystem?: boolean
  isUser?: boolean
}

export default function ChatRoom({ token, serverUrl, username, roomName }: ChatRoomProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false)
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    let newRoom: Room

    const connectToRoom = async () => {
      try {
        newRoom = new Room({
          adaptiveStream: true,
        })

        newRoom.on(RoomEvent.Connected, () => {
          setConnected(true)
          setParticipants(Array.from(newRoom.remoteParticipants.values()))
        })

        newRoom.on(RoomEvent.Disconnected, () => {
          setConnected(false)
          setParticipants([])
        })

        newRoom.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: Participant) => {
          const decoder = new TextDecoder()
          const messageData = JSON.parse(decoder.decode(payload))
          
          const message: Message = {
            id: Date.now() + Math.random(),
            text: messageData.message,
            sender: participant?.identity || 'Unknown',
            timestamp: new Date(),
            isBot: participant?.identity === 'AI Assistant',
          }
          
          setMessages(prev => [...prev, message])
        })

        newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          setParticipants(prev => [...prev, participant])
          if (participant.identity !== username) {
            const joinMessage: Message = {
              id: Date.now() + Math.random(),
              text: `${participant.identity} joined the chat`,
              sender: 'System',
              timestamp: new Date(),
              isSystem: true,
            }
            setMessages(prev => [...prev, joinMessage])
          }
        })

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          setParticipants(prev => prev.filter(p => p.identity !== participant.identity))
          if (participant.identity !== username) {
            const leaveMessage: Message = {
              id: Date.now() + Math.random(),
              text: `${participant.identity} left the chat`,
              sender: 'System',
              timestamp: new Date(),
              isSystem: true,
            }
            setMessages(prev => [...prev, leaveMessage])
          }
        })

        await newRoom.connect(serverUrl, token)
        setRoom(newRoom)

        const welcomeMessage: Message = {
          id: Date.now() + Math.random(),
          text: `Welcome to ${roomName}, ${username}! Start chatting with the AI assistant.`,
          sender: 'System',
          timestamp: new Date(),
          isSystem: true,
        }
        setMessages([welcomeMessage])

      } catch (error) {
        console.error('Failed to connect to room:', error)
      }
    }

    connectToRoom()

    return () => {
      if (newRoom) {
        newRoom.disconnect()
      }
    }
  }, [token, serverUrl, roomName, username])

  const sendMessage = async () => {
    if (!newMessage.trim() || !room || !connected) return

    setLoading(true)
    
    try {
      const userMessage: Message = {
        id: Date.now() + Math.random(),
        text: newMessage.trim(),
        sender: username,
        timestamp: new Date(),
        isUser: true,
      }
      setMessages(prev => [...prev, userMessage])

      const messageData = {
        message: newMessage.trim(),
        sender: username,
        timestamp: new Date().toISOString(),
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(messageData))
      
      await room.localParticipant.publishData(data, { reliable: true })
      
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }

  return (
    <div className="flex flex-col h-96">

      <div className="px-4 py-2 bg-[#18181B] border-b border-neutral-950/30 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-neutral-400">
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="text-sm text-neutral-400">
          {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 chat-messages">
        <MessageList messages={messages} currentUser={username} />
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-[#18181B]">
        <div className="flex space-x-2">
          <input type="text" value={newMessage} onChange={handleInputChange} disabled={!connected || loading}
            className="flex-1 px-3 py-2 border border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-neutral-800 text-neutral-50 transition-all duration-150"
            placeholder="Type your message..." 
          />
          <button onClick={sendMessage} disabled={!connected || loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors">
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Press Enter to send
        </div>
      </div>
    </div>
  )
}