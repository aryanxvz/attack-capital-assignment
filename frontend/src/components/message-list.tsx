'use client'
import { Bot, User, Info } from 'lucide-react'

type Message = {
  id: number
  text: string
  sender: string
  timestamp: Date | string
  isBot?: boolean
  isSystem?: boolean
  isUser?: boolean
}

type MessageListProps = {
  messages: Message[]
  currentUser: string
  isTyping?: boolean
}

export default function MessageList({ messages, currentUser, isTyping }: MessageListProps) {
  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageStyle = (message: Message) => {
    if (message.isSystem) {
      return 'mx-auto max-w-sm'
    }
    if (message.isBot) {
      return 'mr-12'
    }
    if (message.isUser || message.sender === currentUser) {
      return 'ml-12'
    }
    return 'mr-12'
  }

  const getSenderIcon = (message: Message) => {
    if (message.isBot) {
      return <Bot className="w-5 h-5 text-blue-300" />
    }
    if (message.isUser || message.sender === currentUser) {
      return <User className="w-5 h-5 text-emerald-300" />
    }
    if (message.isSystem) {
      return <Info className="w-4 h-4 text-neutral-400" />
    }
    return <User className="w-5 h-5 text-purple-300" />
  }

  const getSenderLabel = (message: Message) => {
    if (message.isSystem) return null
    if (message.isBot) return 'AI Assistant'
    if (message.isUser || message.sender === currentUser) return 'You'
    return message.sender
  }

  const getBubbleStyle = (message: Message) => {
    if (message.isSystem) {
      return 'bg-neutral-800/50 text-neutral-300 border border-neutral-700/50 backdrop-blur-sm'
    }
    if (message.isBot) {
      return 'bg-gradient-to-br from-neutral-700/60 to-neutral-800/80 text-blue-100 border border-neutral-500/30 shadow-sm shadow-blue-500/10'
    }
    if (message.isUser || message.sender === currentUser) {
      return 'bg-gradient-to-br from-neutral-600/60 to-neutral-700/80 text-emerald-100 border border-emerald-500/30'
    }
    return 'bg-gradient-to-br from-neutral-700/60 to-neutral-800/80 text-purple-100 border border-purple-500/30'
  }

  const getAvatarStyle = (message: Message) => {
    if (message.isBot) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
    }
    if (message.isUser || message.sender === currentUser) {
      return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25'
    }
    return 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25'
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-neutral-400 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-8 h-8 text-neutral-300" />
          </div>
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Start the conversation!</h3>
          <p className="text-sm text-neutral-500">Send a message to chat with the AI Assistant</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={getMessageStyle(message)}>
          {message.isSystem ? (
            <div className="flex items-center justify-center space-x-2 py-2">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm">
                {getSenderIcon(message)}
                <span className="text-sm font-medium text-neutral-300">{message.text}</span>
              </div>
            </div>
          ) : (
            <div className={`flex space-x-3 ${message.isUser || message.sender === currentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarStyle(message)}`}>
                {getSenderIcon(message)}
              </div>
              
              <div className="flex-1 max-w-sm">
                <div className={`px-4 py-3 rounded-2xl backdrop-blur-sm ${getBubbleStyle(message)}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm opacity-90">
                      {getSenderLabel(message)}
                    </span>
                    <span className="text-xs opacity-60">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isTyping && (
        <div className="mr-12">
          <div className="flex space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <Bot className="w-5 h-5 text-blue-300" />
            </div>
            
            <div className="flex-1 max-w-sm">
              <div className="px-4 py-3 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-neutral-700/60 to-neutral-800/80 border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-200">AI Assistant is typing</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}