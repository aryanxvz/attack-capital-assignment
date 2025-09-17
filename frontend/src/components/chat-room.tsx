'use client'
import { useEffect, useState, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { Room, RoomEvent, DataPacket_Kind, RemoteParticipant, LocalParticipant, Participant } from 'livekit-client'
import MessageList from './message-list'
import { Send, Users, Wifi, WifiOff } from 'lucide-react'

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
  const [isTyping, setIsTyping] = useState<boolean>(false)
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
          const welcomeMessage: Message = {
            id: Date.now() + Math.random(),
            text: `Welcome to ${roomName}, ${username}! 🎉`,
            sender: 'System',
            timestamp: new Date(),
            isSystem: true,
          }
          setMessages([welcomeMessage])
        })

        newRoom.on(RoomEvent.Disconnected, () => {
          setConnected(false)
          setParticipants([])
        })

        newRoom.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: Participant, kind?: DataPacket_Kind) => {
          try {
            const decoder = new TextDecoder()
            const messageData = JSON.parse(decoder.decode(payload))

            if (messageData.sender === username) {
              return
            }

            const message: Message = {
              id: Date.now() + Math.random(),
              text: messageData.message,
              sender: messageData.sender || participant?.identity || 'Unknown',
              timestamp: new Date(),
              isBot: participant?.identity === 'AI-Assistant' || messageData.sender === 'AI-Assistant',
              isUser: false,
            }

            setMessages(prev => [...prev, message])
            setIsTyping(false)
          } catch (error) {
          }
        })

        newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          setParticipants(prev => [...prev, participant])
          if (participant.identity !== username && participant.identity !== 'AI-Assistant') {
            const joinMessage: Message = {
              id: Date.now() + Math.random(),
              text: `${participant.identity} joined the conversation 👋`,
              sender: 'System',
              timestamp: new Date(),
              isSystem: true,
            }
            setMessages(prev => [...prev, joinMessage])
          }
        })

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          setParticipants(prev => prev.filter(p => p.identity !== participant.identity))
          if (participant.identity !== username && participant.identity !== 'AI-Assistant') {
            const leaveMessage: Message = {
              id: Date.now() + Math.random(),
              text: `${participant.identity} left the conversation 👋`,
              sender: 'System',
              timestamp: new Date(),
              isSystem: true,
            }
            setMessages(prev => [...prev, leaveMessage])
          }
        })

        await newRoom.connect(serverUrl, token)
        setRoom(newRoom)
      } catch (error) {
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
    if (!newMessage.trim() || !room || !connected || loading) {
      return
    }

    setLoading(true)
    setIsTyping(true)

    try {
      const messageData = {
        message: newMessage.trim(),
        sender: username,
        timestamp: new Date().toISOString(),
      }

      const userMessage: Message = {
        id: Date.now() + Math.random(),
        text: newMessage.trim(),
        sender: username,
        timestamp: new Date(),
        isUser: true,
      }

      setMessages(prev => [...prev, userMessage])

      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify(messageData))

      await room.localParticipant.publishData(data, { reliable: true })
      setNewMessage('')
    } catch (error) {
      setMessages(prev => prev.slice(0, -1))
      setIsTyping(false)
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

  const aiParticipant = participants.find(p => p.identity === 'AI-Assistant')
  const humanParticipants = participants.filter(p => p.identity !== 'AI-Assistant')

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden border border-neutral-700/50 shadow-2xl">

      <div className="px-6 py-2 bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 backdrop-blur-sm border-b border-neutral-600/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {connected ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            {aiParticipant && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-300 font-medium">AI Assistant Active</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              {humanParticipants.length + 1} participant{humanParticipants.length !== 0 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <MessageList messages={messages} currentUser={username} isTyping={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 backdrop-blur-sm border-t border-neutral-600/30">
        <div className="flex space-x-3">
          <input type="text"  value={newMessage} onChange={handleInputChange} onKeyPress={handleKeyPress} disabled={!connected || loading}
            className="flex-1 px-4 bg-neutral-700/50 border border-neutral-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent disabled:opacity-50 text-white placeholder-neutral-400 transition-all duration-200 backdrop-blur-sm"
            placeholder={connected ? "Type your message..." : "Connecting..."}
          />
          <button onClick={sendMessage} disabled={!connected || loading || !newMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 min-w-[100px] justify-center shadow-lg shadow-blue-500/25">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-xs text-neutral-400 mt-2 text-center">
          Press Enter to send • Chat with AI Assistant powered by memory
        </div>
      </div>
    </div>
  )
}